'use client';

import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import { FaApple, FaWindows } from "react-icons/fa";
import { DiLinux } from "react-icons/di";
import Link from 'next/link';

export default function DownloadsPage() {
  const [selectedOS, setSelectedOS] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({});
  const [checkingDownloads, setCheckingDownloads] = useState(true);

  const downloadOptions = [
    {
      os: 'windows',
      name: 'Windows',
      icon: FaWindows,
      versions: [
        {
          version: '1.0.0',
          type: 'exe',
          size: '125 MB',
          link: '/api/downloads/windo',
          checksum: 'df5d80226034f0755750e6f2e5747ff7',
          releaseDate: '2026-02-07',
        },
      ],
    },
    {
      os: 'mac',
      name: 'macOS',
      icon: FaApple,
      versions: [
        {
          version: '1.0.0',
          type: 'dmg',
          size: '130 MB',
          link: 'https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg',
          checksum: 'm1a2c3d4e5f6...',
          releaseDate: '2026-02-07',
        },
      ],
    },
    {
      os: 'linux',
      name: 'Linux',
      icon: DiLinux,
      versions: [
        {
          version: '1.0.0',
          type: 'AppImage',
          size: '135 MB',
          link: 'https://releases.nitminer.com/nitminer-1.0.0-linux-x64.AppImage',
          checksum: 'l1i2n3u4x5...',
          releaseDate: '2026-02-07',
        },
      ],
    },
    
  ];

  // Check download availability
  useEffect(() => {
    const verifyDownloads = async () => {
      try {
        const statusMap = {};
        
        // Windows is available (served locally)
        statusMap['/api/downloads/windows'] = true;
        
        // Check macOS availability (external URL)
        try {
          const macResponse = await fetch('https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg', { 
            method: 'HEAD',
            redirect: 'follow'
          });
          statusMap['https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg'] = macResponse.ok;
        } catch {
          statusMap['https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg'] = false;
        }
        
        // Check Linux availability (external URL)
        try {
          const linuxResponse = await fetch('https://releases.nitminer.com/nitminer-1.0.0-linux-x64.AppImage', { 
            method: 'HEAD',
            redirect: 'follow'
          });
          statusMap['https://releases.nitminer.com/nitminer-1.0.0-linux-x64.AppImage'] = linuxResponse.ok;
        } catch {
          statusMap['https://releases.nitminer.com/nitminer-1.0.0-linux-x64.AppImage'] = false;
        }
        
        setDownloadStatus(statusMap);
      } catch (error) {
        console.warn('Failed to verify downloads:', error);
        // Force Windows available, mark macOS as unavailable
        const statusMap = {
          '/api/downloads/windows': true,
          'https://releases.nitminer.com/nitminer-1.0.0-mac-universal.dmg': false,
          'https://releases.nitminer.com/nitminer-1.0.0-linux-x64.AppImage': false,
        };
        setDownloadStatus(statusMap);
      } finally {
        setCheckingDownloads(false);
      }
    };

    verifyDownloads();
  }, []);

  const formatDate = (dateString) => {
    // Format date consistently: DD/MM/YYYY
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-32 pb-16">
      {/* Navigation Breadcrumb */}
      {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Downloads</span>
        </nav>
      </div> */}

      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Download NITMiner
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Get the latest version of NitMiner Desktop for Windows, macOS, and Linux. Always stay updated with the newest features and security patches.
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {downloadOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOS === option.os;

            return (
              <div
                key={option.os}
                className={`relative rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                } p-8 cursor-pointer`}
                onClick={() => setSelectedOS(isSelected ? null : option.os)}
              >
                {/* OS Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <IconComponent size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {option.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.os === 'windows' ? 'Windows 10 & above' : option.os === 'mac' ? 'macOS 10.13 & above' : 'Ubuntu 18.04+, CentOS 7+, Fedora 30+'}
                    </p>
                  </div>
                </div>

                {/* Versions */}
                <div className="space-y-4">
                  {option.versions.map((version, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-gray-900">
                            v{version.version}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {version.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Size: {version.size}</p>
                          <p>Released: {formatDate(version.releaseDate)}</p>
                          <p className="font-mono text-[10px] break-all">{version.checksum}</p>
                        </div>
                      </div>
                      {downloadStatus[version.link] === false ? (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-600 font-black rounded-xl cursor-not-allowed text-center whitespace-nowrap opacity-50">
                          <FiDownload size={18} />
                          Coming Soon..
                        </div>
                      ) : (
                        <a
                          href={version.link}
                          download={`nitminer-${version.version}.${version.type}`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 font-black rounded-xl cursor-not-allowed text-center whitespace-nowrap opacity-50"
                          title={`Download NitMiner ${version.version} for ${option.name}`}
                        >
                          <FiDownload size={18} />
                          {checkingDownloads ? 'Verifying...' : 'Coming Soon..'}
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Installation Instructions */}
                {isSelected && (
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border-l-4 border-blue-600">
                    <h4 className="font-black text-gray-900 dark:text-white mb-3">
                      Installation Instructions
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                      {option.os === 'windows' ? (
                        <>
                          <li>Download the .exe file from the link above</li>
                          <li>Double-click the installer to launch the setup wizard</li>
                          <li>Follow the on-screen instructions to complete installation</li>
                          <li>Launch NitMiner from your Start Menu or Desktop shortcut</li>
                          <li>Log in with your account credentials</li>
                        </>
                      ) : option.os === 'mac' ? (
                        <>
                          <li>Download the .dmg file from the link above</li>
                          <li>Open the .dmg file by double-clicking it</li>
                          <li>Drag NitMiner.app to the Applications folder</li>
                          <li>Open Applications folder and launch NitMiner</li>
                          <li>Log in with your account credentials</li>
                        </>
                      ) : (
                        <>
                          <li>Download the .AppImage file from the link above</li>
                          <li>Make the file executable: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">chmod +x nitminer-*.AppImage</code></li>
                          <li>Run the application: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">./nitminer-*.AppImage</code></li>
                          <li>Alternatively, double-click the file in your file manager</li>
                          <li>Log in with your account credentials</li>
                        </>
                      )}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System Requirements */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
            System Requirements
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaWindows size={24} className="text-blue-600" />
                Windows
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>✓ Windows 10 or later</li>
                <li>✓ 4 GB RAM minimum (8 GB recommended)</li>
                <li>✓ 200 MB free disk space</li>
                <li>✓ .NET Framework 4.7.2 or later</li>
                <li>✓ Internet connection required</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaApple size={24} className="text-gray-600 dark:text-gray-300" />
                macOS
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>✓ macOS 10.13 or later</li>
                <li>✓ 4 GB RAM minimum (8 GB recommended)</li>
                <li>✓ 200 MB free disk space</li>
                <li>✓ Intel or Apple Silicon (M1/M2/M3)</li>
                <li>✓ Internet connection required</li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DiLinux size={24} className="text-orange-600" />
                Linux
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>✓ Ubuntu 18.04+, CentOS 7+, Fedora 30+</li>
                <li>✓ 4 GB RAM minimum (8 GB recommended)</li>
                <li>✓ 200 MB free disk space</li>
                <li>✓ glibc 2.27+ (most modern distros)</li>
                <li>✓ Internet connection required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-8 mb-16">
          <h3 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Security & Privacy
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            All NitMiner desktop applications are digitally signed to ensure authenticity and security. Before installation, verify that the file hash matches the checksum listed above.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            NitMiner uses encrypted connections and never requires your private keys. Your security is our top priority.
          </p>
        </div>

        {/* Support Section */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Visit our documentation or contact support for installation assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all duration-300"
            >
              Contact Support
            </a>
            <a
              href="https://docs.nitminer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-black rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
