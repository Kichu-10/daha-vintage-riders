DROP TRIGGER IF EXISTS on_auth_user_created_grant_chief ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_chief
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_chief_admin();

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();