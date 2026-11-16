# Submissions

The `/submit` page posts to a Cloudflare Pages Function, `functions/api/submit.ts`. The function saves each submission to a D1 database and the logo, if one was uploaded, to an R2 bucket. Until both are bound, the form shows "Submissions are not set up on this server yet." and nothing is saved.

## One-time setup in Cloudflare

1. **Create the database.** In the Cloudflare dashboard go to Storage & Databases → D1 → Create, and name it `techverse-submissions`.
2. **Create the table.** Open the database and go to Console. The console joins pasted text into one line, so don't paste the migration file as it is: its `--` comment would swallow everything after it, and you'd get "No SQL statements detected." Run these two statements one at a time instead:
   ```sql
   CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')), status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), name TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('App', 'Website')), creator_handle TEXT NOT NULL, website_url TEXT, android_url TEXT, ios_url TEXT, logo_key TEXT, contact_email TEXT NOT NULL);
   ```
   ```sql
   CREATE INDEX IF NOT EXISTS submissions_status_created ON submissions (status, created_at);
   ```
   Then type `/tables` in the console; `submissions` should be listed. With wrangler you can run the file directly instead, and the comments are fine there:
   ```sh
   npx wrangler d1 execute techverse-submissions --remote --file=migrations/0001_submissions.sql
   ```
3. **Create the logo bucket (optional).** Go to R2 → Create bucket and name it `techverse-logos`. Leave public access off. Turning on R2 asks for a card but costs $0 within the free tier (10 GB storage and 1M writes a month); one logo is at most 1 MB and one write. Without R2, everything else still works, and logos arrive only as attachments in the notification email.
4. **Bind both to the site.** Open Workers & Pages → `tech-verse-my` → Settings → Bindings, then add:
   - a D1 database binding with variable name `DB`, pointing at `techverse-submissions`
   - an R2 bucket binding with variable name `LOGOS`, pointing at `techverse-logos`

   Add them to Production, and to Preview too if you test on preview deployments.
5. **Redeploy.** Push a commit, or retry the latest deployment, so the function picks up the bindings.

The Pages build settings stay as they are: build command `npm run build`, output directory `out`. Cloudflare finds the `functions/` folder at the repo root by itself.

## Email notifications (Resend)

Each new submission is emailed to you with every field, the logo attached and a ready-to-run approve command. Reply-To is set to the maker, so replying writes to them. The email is sent after the maker sees "in the queue", and if Resend is down or misconfigured the submission is still saved; the error goes to the Pages Function logs.

1. **Get an API key.** Sign up at resend.com, then go to API Keys → Create API key with "Sending access".
2. **Pick a sender.**
   - *No domain yet:* use `Techverse MY <onboarding@resend.dev>`. Resend only delivers from this address to the email you signed up with, which is fine when you're the only recipient.
   - *Your own domain:* add it in Resend → Domains, add the DNS records it shows, then use an address on it, such as `Techverse MY <submissions@yourdomain.com>`. A `pages.dev` address can't be verified.
3. **Add the variables.** In Workers & Pages → `tech-verse-my` → Settings → Variables and Secrets, add these for Production:

   | Name | Value | Type |
   | --- | --- | --- |
   | `RESEND_API_KEY` | the key from step 1 | Secret (encrypt it) |
   | `NOTIFY_TO` | where notifications go; separate several addresses with commas | Text |
   | `NOTIFY_FROM` | the sender from step 2 | Text |

4. **Redeploy** so the function picks them up.

If any of the three is missing, the form keeps working and simply sends no email.

## Reading submissions

In D1 → `techverse-submissions` → Console:

```sql
SELECT created_at, name, category, type, creator_handle, website_url, android_url, ios_url, logo_key, contact_email
FROM submissions
WHERE status = 'pending'
ORDER BY created_at DESC;
```

Logos are in R2 → `techverse-logos`, under `submissions/<id>.png|jpg|webp`, where `<id>` is the submission's `id`.

## Approving a listing

1. Add the product to `src/data/products.ts`. Put its logo in `public/logos/` and make the 256px WebP copy in `public/logos/sm/`.
2. Mark it done:
   ```sql
   UPDATE submissions SET status = 'approved' WHERE id = '<id>';
   ```
   Use `'rejected'` for ones you turn down.

## Testing locally

`next dev` doesn't run Pages Functions, so the form says it didn't go through. To test the whole flow, build the site and run it with wrangler, using a local database and bucket:

```sh
npm run build
npx wrangler d1 execute techverse-submissions --local --file=migrations/0001_submissions.sql
npx wrangler pages dev out --d1 DB=techverse-submissions --r2 LOGOS=techverse-logos
```

To get notification emails locally too, put the three Resend variables in a `.dev.vars` file at the project root, one `NAME=value` per line. Git ignores that file, so the key stays out of the repo.

## Spam

The form has a hidden honeypot field, and the server checks every field, the link hosts, and the logo's real file type and size. If spam gets through anyway, Cloudflare Turnstile is the next step: it needs a site key and a secret from the dashboard.
