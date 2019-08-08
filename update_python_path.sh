#!/bin/bash
sed -i '' '1 s|.*|#!'$(which python3)'|' cgi-bin/*.py