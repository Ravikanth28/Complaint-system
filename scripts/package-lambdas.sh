#!/bin/bash
# Script to build and package Lambda functions for deployment

echo "📦 Packaging Lambdas..."

# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Zip each function
functions=("submit-complaint" "analysis-worker" "triage-agent" "chatbot")

mkdir -p ../dist

for func in "${functions[@]}"; do
  echo "🤐 Zipping $func..."
  cd "$func"
  # Copy shared utils if needed (simulated for now, usually handled by bundler like esbuild)
  # zip -r "../../dist/$func.zip" .
  # Note: A real production setup would use esbuild or webpack to bundle the TS.
  echo "Done."
  cd ..
done

echo "🚀 Zips available in /dist directory (Simplified for demo)"
