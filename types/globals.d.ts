// Augments Clerk's JWT session claims to include the role field we set in publicMetadata
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: string
    }
  }
}

export {}
