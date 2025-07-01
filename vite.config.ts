import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to extract service URLs from config
const getProxyConfig = () => {
  const configPath = join(__dirname, 'public/config.json');
  
  if (!existsSync(configPath)) {
    console.log('No config.json found, skipping proxy setup');
    return {};
  }
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const proxy = {};
    const processedHosts = new Set();
    
    // Extract all unique service URLs from config
    if (config.instances) {
      Object.values(config.instances).forEach((instance: any) => {
        Object.values(instance.environments || {}).forEach((env: any) => {
          Object.values(env.services || {}).forEach((service: any) => {
            if (service.url) {
              try {
                const url = new URL(service.url);
                const host = url.host;
                
                // Only add proxy for each unique host once
                if (!processedHosts.has(host)) {
                  processedHosts.add(host);
                  // Create a proxy path for this host
                  const proxyPath = `/api/${host}`;
                  proxy[proxyPath] = {
                    target: `${url.protocol}//${url.host}`,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(`/api/${host}`, ''),
                    secure: false,
                    ws: false,
                    // This is crucial - we need to handle the response ourselves
                    selfHandleResponse: true,
                    configure: (proxy) => {
                      proxy.on('proxyRes', (proxyRes, req, res) => {
                        // Log for debugging
                        console.log(`Proxy response for ${req.url}:`, {
                          statusCode: proxyRes.statusCode,
                          statusMessage: proxyRes.statusMessage
                        });
                        
                        // Set the status code from the proxied response
                        res.statusCode = proxyRes.statusCode || 500;
                        
                        // Copy all headers
                        Object.keys(proxyRes.headers).forEach(key => {
                          res.setHeader(key, proxyRes.headers[key]);
                        });
                        
                        // Pipe the response body
                        proxyRes.pipe(res);
                      });
                      
                      proxy.on('error', (err, req, res) => {
                        console.error('Proxy error:', err);
                        if (!res.headersSent) {
                          res.writeHead(500, {
                            'Content-Type': 'text/plain'
                          });
                        }
                        res.end('Proxy error: ' + err.message);
                      });
                    }
                  };
                }
              } catch (e) {
                console.warn(`Invalid URL in config: ${service.url}`);
              }
            }
          });
        });
      });
    }
    
    console.log('Proxy configuration:', proxy);
    return proxy;
  } catch (error) {
    console.error('Error reading config.json:', error);
    return {};
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {}
  },
  server: {
    proxy: getProxyConfig()
  }
})
