-- Add admin user to the database
-- Password: Admin123! (will be hashed)

-- First, check if the admin user already exists
SET @admin_bilkent_id = 'admin123';
SET @admin_exists = (SELECT COUNT(*) FROM users WHERE bilkent_id = @admin_bilkent_id);

-- Only insert if the admin doesn't exist
SET @hashed_password = '$2a$10$JcX5XMnSuYJe8sMkzrPYCOKnvLaQrCUkM4G1Aq7BVDgzF6x2S1oMW'; -- Hashed version of 'Admin123!'

-- Insert the admin user if not exists
INSERT INTO users (bilkent_id, email, password, full_name, role)
SELECT @admin_bilkent_id, 'admin@bilkent.edu.tr', @hashed_password, 'System Administrator', 'admin'
WHERE @admin_exists = 0;
