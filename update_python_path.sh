#!/bin/bash
for i in cgi-bin/*.py; do
  sed -i '' '1 s|.*|#!'$(which python3)'|' $i
done
