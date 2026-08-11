export const CHARSET_SIZES = { lowercase: 26, uppercase: 26, digits: 10, symbols: 32 };

export const SCHEMES = {
  zipcrypto: { label: "Legacy ZIP password (\"ZipCrypto\")" },
  aes256zip: { label: "Modern AES-256 zip (7-Zip / WinZip AE-2)" },
  office: { label: "Password-protected Office document (2013+)" },
};

export const HARDWARE_TIERS = {
  laptop: { label: "Laptop CPU" },
  gpu: { label: "Consumer gaming GPU (RTX-4090-class)" },
  cluster: { label: "Rented cloud GPU cluster (~64 GPUs)" },
};

// Guesses/second, [scheme][tier]. The `gpu` column is anchored to published
// hashcat v6.2.6 benchmarks on an RTX 4090 (mode 17200 PKZIP/ZipCrypto,
// mode 13600 WinZip AES, mode 9600 Office 2013+). `laptop` and `cluster` are
// illustrative scaling factors on top of that anchor, not independently
// benchmarked: laptop = gpu / 1500 (zipcrypto), gpu / 1000 (aes256zip/office);
// cluster = gpu * 64 for all schemes.
export const GUESS_RATES = {
  zipcrypto: { laptop: 2.0e7, gpu: 3.0e10, cluster: 1.92e12 },
  aes256zip: { laptop: 2.0e4, gpu: 2.0e7, cluster: 1.28e9 },
  office: { laptop: 1.3e3, gpu: 6.6e4, cluster: 4.25e6 },
};

export const DICTIONARY_SEARCH_SPACE = 1.0e7;
