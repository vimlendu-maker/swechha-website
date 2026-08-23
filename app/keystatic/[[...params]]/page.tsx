/* The editor UI. Client-only by necessity: Keystatic's app is a React SPA. */
'use client';

import { makePage } from '@keystatic/next/ui/app';
import config from '../../../keystatic.config';

export default makePage(config);
