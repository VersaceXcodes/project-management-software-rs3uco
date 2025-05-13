#!/bin/bash
cd ../../apps/project-management-software/
grep -n ");}" vitereact/src/components/views/UV_Dashboard.tsx
tail -n 10 vitereact/src/components/views/UV_Dashboard.tsx