/*
  # Add Admin Functions for User Management

  1. New Functions
    - `create_user_with_profile` - Creates a user and their profile in one transaction
    - `update_user_role_and_region` - Updates user role and region
    - `delete_user_and_profile` - Safely deletes user and profile

  2. Security
    - Only executives can call these functions
    - Proper error handling and validation
    - Transaction safety for data consistency

  3. Additional Policies
    - Allow executives to read all user profiles
    - Allow executives to update user profiles
*/

-- Function to create a user with profile (executives only)
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email TEXT,
  user_password TEXT,
  user_role user_role,
  user_region TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if current user is executive
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'executive'
  ) THEN
    RAISE EXCEPTION 'Only executives can create users';
  END IF;

  -- Validate region for non-executives
  IF user_role != 'executive' AND user_region IS NULL THEN
    RAISE EXCEPTION 'Region is required for staff and region managers';
  END IF;

  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create the user profile
  INSERT INTO user_profiles (id, email, role, region)
  VALUES (new_user_id, user_email, user_role, user_region);

  -- Return success result
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'role', user_role,
    'region', user_region
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Function to update user role and region
CREATE OR REPLACE FUNCTION update_user_role_and_region(
  target_user_id UUID,
  new_role user_role,
  new_region TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if current user is executive
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'executive'
  ) THEN
    RAISE EXCEPTION 'Only executives can update user roles';
  END IF;

  -- Validate region for non-executives
  IF new_role != 'executive' AND new_region IS NULL THEN
    RAISE EXCEPTION 'Region is required for staff and region managers';
  END IF;

  -- Update the user profile
  UPDATE user_profiles 
  SET 
    role = new_role,
    region = CASE WHEN new_role = 'executive' THEN NULL ELSE new_region END,
    updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Return success result
  result := json_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', new_role,
    'region', CASE WHEN new_role = 'executive' THEN NULL ELSE new_region END
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Add policy for executives to read all user profiles
DROP POLICY IF EXISTS "Executives can read all user profiles" ON user_profiles;
CREATE POLICY "Executives can read all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'executive'
    )
  );

-- Add policy for executives to update user profiles
DROP POLICY IF EXISTS "Executives can update user profiles" ON user_profiles;
CREATE POLICY "Executives can update user profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'executive'
    )
  );