export type CloudProvider = 'none' | 'github-gist' | 'github-repo' | 'firebase';

export interface CloudPublicConfig {
  provider: CloudProvider;
  /** GitHub Gist ID (public read — safe to commit) */
  gistId: string;
  gistFilename: string;
  /** GitHub Repo coordinates (public read — safe to commit) */
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubFilePath: string;
  /** Firebase Realtime Database JSON endpoint (public read — safe to commit) */
  firebaseUrl: string;
}

/**
 * WORLDWIDE READ CONFIGURATION
 * ----------------------------
 * Every visitor's browser reads this file on startup to fetch your latest
 * published edits from Firebase Realtime Database. No private tokens or
 * secrets are stored here.
 */
export const CLOUD_PUBLIC_CONFIG: CloudPublicConfig = {
  provider: 'firebase',
  gistId: '',
  gistFilename: 'rahas-site-content.json',
  githubOwner: 'rahassharma',
  githubRepo: '',
  githubBranch: 'main',
  githubFilePath: 'public/site-content.json',
  firebaseUrl:
    'https://rahas-sharma-default-rtdb.asia-southeast1.firebasedatabase.app/site.json',
};
