/*
 * -- copyright
 * OpenProject is an open source project management software.
 * Copyright (C) the OpenProject GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 3.
 *
 * OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
 * Copyright (C) 2006-2013 Jean-Philippe Lang
 * Copyright (C) 2010-2013 the ChiliProject Team
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * See COPYRIGHT and LICENSE files for more details.
 * ++
 */

import type { Plugin } from 'esbuild';

const customConfigPlugin:Plugin = {
  name: 'custom-config',
  setup({ initialOptions: options }) {
    if (options.chunkNames === '[name]-[hash]') { // named chunks
      options.chunkNames = '[dir]/[name]-[hash]';
    }
  }
}

// Plugin to handle Node.js built-in modules that are required by browser libraries like @xeokit/xeokit-sdk
const nodeBuiltinsPlugin:Plugin = {
  name: 'node-builtins',
  setup(build) {
    // Mark Node.js built-in modules as external and provide empty stubs
    const nodeBuiltins = ['fs', 'path', 'os', 'crypto', 'stream', 'util', 'events', 'buffer', 'child_process', 'net', 'tls', 'http', 'https', 'zlib'];

    build.onResolve({ filter: new RegExp(`^(${nodeBuiltins.join('|')})$`) }, args => {
      return {
        path: args.path,
        namespace: 'node-empty-stub',
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'node-empty-stub' }, () => {
      return {
        contents: 'export default {}; export const readFileSync = () => null; export const existsSync = () => false;',
        loader: 'js',
      };
    });
  }
}

export default [customConfigPlugin, nodeBuiltinsPlugin];
