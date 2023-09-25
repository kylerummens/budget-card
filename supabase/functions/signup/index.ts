import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import column, { ColumnError } from "../_shared/adapters/column-adapter.ts";

const DOBRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format regex
const DOBSchema = z.string().refine((dob) => DOBRegex.test(dob), {
  message: "Invalid date of birth format (YYYY-MM-DD)",
});

const USStateAbbreviations = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  // US territories
  "AS",
  "DC",
  "FM",
  "GU",
  "MH",
  "MP",
  "PW",
  "PR",
  "VI",
];
const StateSchema = z.string().refine((state) => {
  return USStateAbbreviations.includes(state.toUpperCase());
}, {
  message: "Invalid US state or territory abbreviation",
});

const CountryCodeSchema = z.string().refine((code) => /^[A-Z]{2}$/.test(code), {
  message: "Invalid ISO 3166-1 Alpha-2 country code",
});

const SsnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
const SsnSchema = z.string().refine((ssn) => SsnRegex.test(ssn), {
  message: "Invalid SSN format (XXX-XX-XXXX or XXXXXXXXX)",
});

const PassportSchema = z.object({
  number: z.string(),
  country_code: z.string(),
});

const Entity = z.object({
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
  ssn: SsnSchema.optional(),
  passport: PassportSchema.optional(),
  date_of_birth: DOBSchema,
  email: z.string().email(),
  address: z.object({
    line_1: z.string(),
    line_2: z.string().optional(),
    city: z.string(),
    state: StateSchema.optional(),
    postal_code: z.string().optional(),
    country_code: CountryCodeSchema,
  }).refine((address) => {
    return address.state || (!address.state && address.country_code !== "US");
  }, { message: "Invalid address" }),
}).refine(entity => {
  return entity.ssn || entity.passport
}, { message: 'A valid SSN or passport is required' });

serve(async (req) => {

  try {
    const entities = await column.entities.list();
    return new Response(JSON.stringify(entities), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch(err) {
    if(err instanceof ColumnError) {
      return new Response(err.toString(), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      })
    }
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }

  /*
  try {

    / *
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if(!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }
    * /


    const body = await req.json();
    const result = Entity.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ errors: JSON.parse(result.error.message) }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const entity = result.data;

    // TODO: Create entity in Column

    return new Response(JSON.stringify(entity), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }*/
});
