// ============================================================
// PSGC API
// ============================================================

const PSGC_API =
  "https://psgc.cloud/api/v2";


// ============================================================
// TYPES
// ============================================================

export interface PsgcItem {
  code: string;
  name: string;
}

export interface PsgcMunicipality
  extends PsgcItem {
  type?: string;
}

export interface PsgcBarangay
  extends PsgcItem {
  status?: string;
}


// ============================================================
// RESPONSE NORMALIZER
// ============================================================

function normalizeList<T>(
  response: unknown
): T[] {

  // ----------------------------------------------------------
  // Direct array
  // ----------------------------------------------------------

  if (Array.isArray(response)) {
    return response as T[];
  }


  // ----------------------------------------------------------
  // { data: [...] }
  // ----------------------------------------------------------

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {

    const data =
      (
        response as {
          data?: unknown;
        }
      ).data;

    if (Array.isArray(data)) {
      return data as T[];
    }


    // --------------------------------------------------------
    // { data: { data: [...] } }
    // --------------------------------------------------------

    if (
      typeof data === "object" &&
      data !== null &&
      "data" in data
    ) {

      const nested =
        (
          data as {
            data?: unknown;
          }
        ).data;

      if (Array.isArray(nested)) {
        return nested as T[];
      }
    }
  }


  // ----------------------------------------------------------
  // { results: [...] }
  // ----------------------------------------------------------

  if (
    typeof response === "object" &&
    response !== null &&
    "results" in response
  ) {

    const results =
      (
        response as {
          results?: unknown;
        }
      ).results;

    if (Array.isArray(results)) {
      return results as T[];
    }
  }


  // ----------------------------------------------------------
  // Nothing usable
  // ----------------------------------------------------------

  console.warn(
    "PSGC API returned unexpected format:",
    response
  );

  return [];
}


// ============================================================
// FETCH HELPER
// ============================================================

async function fetchPsgc<T>(
  url: string
): Promise<T[]> {

  const response =
    await fetch(url, {
      cache: "no-store",
    });


  if (!response.ok) {

    const text =
      await response.text();

    console.error(
      "PSGC API ERROR:",
      response.status,
      text
    );

    throw new Error(
      `PSGC API error: ${response.status}`
    );
  }


  const json =
    await response.json();


  console.log(
    "PSGC API:",
    url,
    json
  );


  return normalizeList<T>(
    json
  );
}


// ============================================================
// PROVINCES
// ============================================================

export async function getProvinces(): Promise<
  PsgcItem[]
> {

  return fetchPsgc<PsgcItem>(
    `${PSGC_API}/provinces`
  );
}


// ============================================================
// MUNICIPALITIES / CITIES
// ============================================================

export async function getMunicipalities(
  provinceCode: string
): Promise<PsgcMunicipality[]> {

  if (!provinceCode) {
    return [];
  }


  return fetchPsgc<PsgcMunicipality>(
    `${PSGC_API}/provinces/${encodeURIComponent(
      provinceCode
    )}/cities-municipalities`
  );
}


// ============================================================
// BARANGAYS
// ============================================================

export async function getBarangays(
  municipalityCode: string
): Promise<PsgcBarangay[]> {

  if (!municipalityCode) {
    return [];
  }


  return fetchPsgc<PsgcBarangay>(
    `${PSGC_API}/cities-municipalities/${encodeURIComponent(
      municipalityCode
    )}/barangays`
  );
}