# Topic 09 — Site Admin Accounts
Scope: platform-level administrators — who they are, how accounts are created, what tools they need, and safeguards.

## Starting assumptions
- Site admins are platform operators, **not** bishops or ward leaders. **Site administration ≠ ward administration.** A bishop has no platform-wide rights; a site admin shouldn't freely impersonate or edit youth accounts.
- Accounts are **invite/provision only**, never public sign-up; created by an existing authorized admin.
- Avoid one giant `admin` permission. Consider Super Admin, Content Admin, Support Admin — or granular permissions.
- **MFA mandatory**, stricter sessions and recovery than normal accounts.
- Every admin action attributable: who changed what, when, from what to what, and why.

## Likely tools
User/account management · ward & bishopric administration (verification queue) · Key/lesson content management · moderation · support · reporting · audit logs · system configuration.

## Actions needing extra safeguards
Account deletion · youth-data access · changing another admin · changing bishopric verification · data export · overriding progress.

## Lifecycle
Creation → activation → role change → suspension → removal → credential recovery → what happens when the person running the site leaves.

## Open decision
One account with extra privileges vs a separate admin identity for someone who's also a normal user (security vs convenience).

## Approach
Build from the role/permission model outward: list every privileged action, then decide who can do it, when, and whether it needs audit or approval — before designing the admin dashboard.
