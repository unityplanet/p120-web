-- P-120 PASS 1C / Function execution hardening.
-- Internal helpers are not browser RPCs; anonymous execution is denied on all privileged functions.
revoke execute on function public.p120_current_auth_session_id() from anon, authenticated;
revoke execute on function public.p120_write_audit(text,text,uuid,jsonb,jsonb,text,text) from anon, authenticated;
revoke execute on function public.p120_handle_auth_user_profile() from anon, authenticated;
revoke execute on function public.p120_set_updated_at() from anon, authenticated;
revoke execute on function public.p120_access_rank(text) from anon, authenticated;

revoke execute on function public.p120_is_active_user(uuid) from anon;
revoke execute on function public.p120_is_founder(uuid) from anon;
revoke execute on function public.p120_can_access_resource(uuid,text) from anon;
revoke execute on function public.p120_create_assessment_session(uuid,text,text,text,uuid) from anon;
revoke execute on function public.p120_attach_participant(uuid,text) from anon;
revoke execute on function public.p120_bind_submission(uuid,text,text) from anon;
revoke execute on function public.p120_admin_set_resource_state(uuid,text,text) from anon;
revoke execute on function public.p120_admin_set_profile_access(uuid,text,text,text) from anon;
revoke execute on function public.p120_admin_grant_entitlement(uuid,uuid,uuid,text,text,timestamptz,timestamptz,text) from anon;
revoke execute on function public.p120_admin_revoke_entitlement(uuid,text) from anon;
revoke execute on function public.p120_admin_set_group_membership(uuid,uuid,text,text) from anon;
