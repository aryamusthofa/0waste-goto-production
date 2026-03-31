# Android Release Checklist

## Security gate (must pass)

- [x] No plaintext secrets in tracked files.
- [x] `package.json` repository URL has no embedded token.
- [x] Partner dev backdoor removed from client.
- [x] SQL governance migration applied (databasesetup6-governance.sql).
- [ ] Super-admin email inserted into `developer_admins` table.
- [ ] Super-admin flag set on profile (`is_super_admin = true`).
- [x] Audit trail RPCs verified (admin_suspend_user, admin_delete_account, admin_hard_delete_product).

## Functional gate (must pass)

- [ ] Register buyer works.
- [ ] Register partner sets `partner_status=pending`.
- [ ] Unapproved partner cannot CRUD products.
- [ ] Approved partner can CRUD products.
- [ ] Checkout place/cancel order RPC works with correct qty restock.
- [ ] Admin console can suspend/delete with reason codes.
- [ ] EcoChat works via Gemini API direct.
- [ ] Wishlist add/remove works.
- [ ] Profile delete account works.

## Build gate (must pass)

- [x] `npm run build` success.
- [x] `npm run smoke` passes.
- [ ] `npm run cap:android` opens Android Studio.
- [ ] Signed APK generated.
- [ ] Signed AAB generated for Play Store.

## Store gate (must pass)

- [ ] App version/bundle version bumped.
- [ ] Privacy policy URL active.
- [ ] Terms of service URL active.
- [ ] Content rating and data safety form completed.
