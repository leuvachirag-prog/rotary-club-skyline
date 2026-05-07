#!/bin/bash
# Firebase Setup Script for Rotary Club Skyline
# Run this after creating your Firebase project at https://console.firebase.google.com

set -e

echo "=== Rotary Club Skyline - Firebase Setup ==="
echo ""

# Check if .env.local already exists
ENV_FILE="apps/web/.env.local"
if [ -f "$ENV_FILE" ]; then
  echo "⚠  $ENV_FILE already exists. Skipping env setup."
else
  if [ ! -f "apps/web/.env.local.example" ]; then
    echo "Error: apps/web/.env.local.example not found. Run from project root."
    exit 1
  fi
  cp apps/web/.env.local.example "$ENV_FILE"
  echo "Created $ENV_FILE from template."
  echo ""
  echo "Next steps:"
  echo "  1. Go to Firebase Console > Project Settings > General"
  echo "  2. Under 'Your apps', click the web app (or create one)"
  echo "  3. Copy the config values into $ENV_FILE"
  echo ""
fi

# Check if Firebase CLI is installed
if command -v firebase &> /dev/null; then
  echo "Firebase CLI found."
  echo ""
  echo "To deploy Firestore rules:  firebase deploy --only firestore:rules"
  echo "To deploy Storage rules:    firebase deploy --only storage"
  echo "To deploy indexes:          firebase deploy --only firestore:indexes"
  echo "To deploy everything:       firebase deploy"
else
  echo "Firebase CLI not found. Install it with:"
  echo "  npm install -g firebase-tools"
  echo ""
  echo "Then run: firebase login && firebase init"
fi

echo ""
echo "=== Firebase Services to Enable ==="
echo "  1. Authentication (Email/Password)"
echo "  2. Cloud Firestore"
echo "  3. Storage"
echo ""
echo "=== Create First Super Admin ==="
echo "  1. Sign up at /auth/signup"
echo "  2. Go to Firebase Console > Firestore"
echo "  3. Find your user document in the 'users' collection"
echo "  4. Set the 'role' field to 'super_admin'"
echo ""
echo "Done! Run 'npm run dev' in apps/web to start."
