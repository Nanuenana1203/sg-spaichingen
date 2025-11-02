import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('ENV_MISSING'); process.exit(2); }

const s = createClient(url, key);
const { data, error } = await s.from('benutzer').select('kennwort').eq('name','Admin').single();

if (error || !data) { console.error('SB_ERR', error); process.exit(2); }

const ok = await bcrypt.compare('Admin', data.kennwort);
console.log('BCRYPT_OK', ok);
process.exit(ok ? 0 : 1);
