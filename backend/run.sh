#!/usr/bin/env bash
# Sobe a API em http://localhost:8080 usando o JDK 21 do Homebrew.
set -euo pipefail
cd "$(dirname "$0")"
if [ -d /opt/homebrew/opt/openjdk@21 ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21
  export PATH="$JAVA_HOME/bin:$PATH"
fi
echo "Java: $(java -version 2>&1 | head -1)"
if [ -x ./mvnw ]; then
  ./mvnw -q spring-boot:run
else
  mvn -q spring-boot:run
fi
