'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import { useTheme } from 'next-themes';

// Import new components
import LanguageTabs from '@/components/tools/LanguageTabs';
import FileViewerModal from '@/components/tools/FileViewerModal';
import SamplesListModal from '@/components/tools/SamplesListModal';
import VisualizationModal from '@/components/tools/VisualizationModal';

function ToolsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [currentTab, setCurrentTab] = useState('c');
  const [currentFile, setCurrentFile] = useState(null);
  const [noOfTrails, setNoOfTrails] = useState(5);
  const [hasPremium, setHasPremium] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [terminalOutputs, setTerminalOutputs] = useState({
    c: '',
    java: '',
    python: '',
    solidity: ''
  });
  const [downloadableFiles, setDownloadableFiles] = useState({
    c: [],
    java: [],
    python: [],
    solidity: []
  });

  // Tool selections
  const [cTool, setCTool] = useState('');
  const [javaTool, setJavaTool] = useState('');
  const [pythonTool, setPythonTool] = useState('Condition Coverage Fuzzing');
  const [solidityTool, setSolidityTool] = useState('VeriSol');
  const [solidityMode, setSolidityMode] = useState('bmc');

  // Tool parameters
  const [cbmcBound, setCbmcBound] = useState('10');
  const [kleemaValue, setKleemaValue] = useState('1');
  const [gmcovVersion, setGmcovVersion] = useState('4');
  const [gmcovTimebound, setGmcovTimebound] = useState('3600');
  const [gmutantVersion, setGmutantVersion] = useState('4');
  const [gmutantTimebound, setGmutantTimebound] = useState('3600');

  // UI states
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [showSamplesListModal, setShowSamplesListModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [samplesList, setSamplesList] = useState([]);
  const [samplesListTitle, setSamplesListTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVisualizationModal, setShowVisualizationModal] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const fileInputRefs = {
    c: useRef(null),
    java: useRef(null),
    python: useRef(null),
    solidity: useRef(null),
  };

  const hasCheckedAuthRef = useRef(false);

  const languages = [
    { id: 'c', name: 'C', color: 'from-blue-500 to-cyan-500' },
    { id: 'java', name: 'Java', color: 'from-orange-500 to-red-500' },
    { id: 'python', name: 'Python', color: 'from-emerald-500 to-teal-500' },
    { id: 'solidity', name: 'Solidity', color: 'from-purple-500 to-pink-500' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    // If user is not authenticated, redirect to login
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    // User is authenticated, set their data
    setEmail(session.user.email);
    setFirstName(session.user.name || '');
    setHasPremium(session.user.isPremium || false);
    setIsAuthChecked(true);
  }, [session, status, router]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut({ callbackUrl: '/login', redirect: true });
    }
  };

  const handleProfileClick = () => {
    router.push('/dashboard');
  };

  const switchTab = (tabId) => {
    setCurrentTab(tabId);
  };

  const browseFile = (type) => {
    const fileInput = fileInputRefs[type]?.current;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileSelect = (event, type) => {
    const file = event.target?.files?.[0];
    if (file) {
      setCurrentFile({ type, file });
    }
  };

  const viewFile = async (type) => {
    if (!currentFile || currentFile.type !== type) {
      alert('Please select a file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result);
      setShowFileViewer(true);
    };
    reader.readAsText(currentFile.file);
  };

  const viewServerFile = async (downloadUrl, fileName) => {
    try {
      const urlParts = downloadUrl.split('/');
      const folderName = urlParts[3];
      const fileNameFromUrl = urlParts.slice(4).join('/');

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/view?filepath=${encodeURIComponent(`/root/Desktop/trustinn-website/${folderName}/${fileNameFromUrl}`)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content);
        setShowFileViewer(true);
      } else {
        alert('Failed to load file content');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Error loading file content');
    }
  };

  const closeFileViewer = () => {
    setShowFileViewer(false);
    setFileContent('');
  };

  const executeCommand = async (type) => {
    if (!currentFile || currentFile.type !== type) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const terminalKey = type;
    setTerminalOutputs(prev => ({ ...prev, [terminalKey]: 'Executing command...\n' }));

    try {
      const formData = new FormData();
      formData.append('file', currentFile.file);
      formData.append('type', type);

      let command = '';
      if (type === 'c') {
        command = generateCCommand();
        if (!command) {
          setLoading(false);
          return;
        }
        formData.append('tool', cTool);

        switch(cTool) {
          case 'Condition Satisfiability Analysis':
            formData.append('bound', cbmcBound);
            break;
          case 'DSE based Mutation Analyser':
            formData.append('value', kleemaValue);
            break;
          case 'Dynamic Symbolic Execution':
            formData.append('toolValue', '1');
            break;
          case 'Dynamic Symbolic Execution with Pruning':
            formData.append('toolValue', '2');
            break;
          case 'Advance Code Coverage Profiler':
            formData.append('version', gmcovVersion);
            formData.append('timebound', gmcovTimebound);
            break;
          case 'Mutation Testing Profiler':
            formData.append('version', gmutantVersion);
            formData.append('timebound', gmutantTimebound);
            break;
        }
      } else if (type === 'solidity') {
        command = generateSolidityCommand();
        formData.append('mode', solidityMode);
      } else if (type === 'java') {
        command = generateJavaCommand();
      } else if (type === 'python') {
        command = generatePythonCommand();
      }

      if (!command) {
        setLoading(false);
        return;
      }

      formData.append('command', command);

      const response = await fetch('/api/execute', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        setTerminalOutputs(prev => ({
          ...prev,
          [terminalKey]: prev[terminalKey] + `❌ Error: ${errorData.error || 'Unknown error'}\n`
        }));
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setTerminalOutputs(prev => ({
          ...prev,
          [terminalKey]: prev[terminalKey] + '✅ Command executed successfully!\n\n' + data.output
        }));
        
        const userEmail = localStorage.getItem('email');
        
        if (!hasPremium && userEmail) {
          try {
            const trailResponse = await fetch('/api/auth/consume-trail', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ email: userEmail })
            });
            
            if (trailResponse.ok) {
              const trailData = await trailResponse.json();
              setNoOfTrails(trailData.noOfTrails);
            }
          } catch (err) {
            console.error('Trail consumption error:', err);
          }
        }
        
        if (data.files && data.files.length > 0) {
          setDownloadableFiles(prev => ({
            ...prev,
            [type]: data.files
          }));
        }
      } else {
        setTerminalOutputs(prev => ({
          ...prev,
          [terminalKey]: prev[terminalKey] + '❌ Error: ' + (data.error || 'Unknown error') + '\n'
        }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Execution error:', error);
      setTerminalOutputs(prev => ({
        ...prev,
        [terminalKey]: prev[terminalKey] + '❌ Network Error: ' + errorMsg + '\n'
      }));
    } finally {
      setLoading(false);
    }
  };

  const generateCCommand = () => {
    if (!cTool) {
      alert('Please select a tool first');
      return null;
    }

    switch(cTool) {
      case 'Condition Satisfiability Analysis':
        if (!cbmcBound) {
          alert('Please enter an unwind bound value');
          return null;
        }
        return `./cbmc_script.sh [FILE] ${cbmcBound}`;

      case 'DSE based Mutation Analyser':
        return `./kleema.sh [FILE] ${kleemaValue}`;

      case 'Dynamic Symbolic Execution':
        return `./klee_native.sh [FILE]`;

      case 'Dynamic Symbolic Execution with Pruning':
        return `./tracerx.sh [FILE]`;

      case 'Advance Code Coverage Profiler':
        if (!gmcovVersion || !gmcovTimebound) {
          alert('Please enter version and time bound values');
          return null;
        }
        return `./main-gProfiler.sh [FILE] ${gmcovVersion} ${gmcovTimebound}`;

      case 'Mutation Testing Profiler':
        if (!gmutantVersion || !gmutantTimebound) {
          alert('Please enter version and time bound values');
          return null;
        }
        return `./main-gProfiler.sh [FILE] ${gmutantVersion} ${gmutantTimebound}`;

      default:
        return null;
    }
  };

  const generateSolidityCommand = () => {
    return `./final.sh [FILE] ${solidityMode}`;
  };

  const generateJavaCommand = () => {
    if (!javaTool) {
      alert('Please select a tool first');
      return null;
    }
    return `./shellsc.sh [FILE]`;
  };

  const generatePythonCommand = () => {
    return `./shellpy.sh [FILE]`;
  };

  const clearTerminal = (type) => {
    setTerminalOutputs(prev => ({ ...prev, [type]: '' }));
  };

  const extractVisualizationData = (output, toolType) => {
    const data = [];

    if (output.includes('MC/DC Report')) {
      const feasibleMatch = output.match(/Total no. of feasible MC\/DC sequences = (\d+)/);
      const totalMatch = output.match(/Total no. of MC\/DC sequences = (\d+)/);
      
      const feasible = parseInt(feasibleMatch?.[1] || '0');
      const total = parseInt(totalMatch?.[1] || '0');
      const infeasible = total - feasible;

      if (total > 0) {
        data.push({ name: 'Feasible Sequences', value: feasible, fill: '#3b82f6' });
        if (infeasible > 0) {
          data.push({ name: 'Infeasible Sequences', value: infeasible, fill: '#ef4444' });
        }
      } else {
        data.push({ name: 'No MC/DC Data', value: 1, fill: '#9ca3af' });
      }
    } else if (output.includes('Mutation Report')) {
      const killedMatch = output.match(/Total no. of Killed Mutants = (\d+)/);
      const totalMatch = output.match(/Total no. of Mutants = (\d+)/);
      
      const killed = parseInt(killedMatch?.[1] || '0');
      const total = parseInt(totalMatch?.[1] || '0');
      const survived = total - killed;

      if (total > 0) {
        data.push({ name: 'Killed Mutants', value: killed, fill: '#10b981' });
        if (survived > 0) {
          data.push({ name: 'Survived Mutants', value: survived, fill: '#f59e0b' });
        }
      } else {
        data.push({ name: 'No Mutation Data', value: 1, fill: '#9ca3af' });
      }
    } else if (output.includes('Final Result Report from CBMC') || output.includes('Reachable paths')) {
      const reachableMatch = output.match(/Total number of Reachable paths or valid test cases\s*=:\s*(\d+)/);
      const unreachableMatch = output.match(/Total number of Unreachable paths or invalid test cases\s*=:\s*(\d+)/);
      
      const reachable = parseInt(reachableMatch?.[1] || '0');
      const unreachable = parseInt(unreachableMatch?.[1] || '0');
      const total = reachable + unreachable;

      if (total > 0) {
        data.push({ name: 'Reachable/Valid Paths', value: reachable, fill: '#10b981' });
        if (unreachable > 0) {
          data.push({ name: 'Unreachable/Invalid Paths', value: unreachable, fill: '#ef4444' });
        }
      } else {
        data.push({ name: 'No Path Data', value: 1, fill: '#9ca3af' });
      }
    } else if (output.includes('KLEEMA') || output.match(/Mutation.*analysis|DSE.*mutation/i)) {
      const mutantsMatch = output.match(/Number of mutants\s*=?\s*(\d+)/i);
      const killedMatch = output.match(/Mutants killed|Dead mutants\s*=?\s*(\d+)/i);
      
      const mutants = parseInt(mutantsMatch?.[1] || '0');
      const killed = parseInt(killedMatch?.[1] || '0');
      const survived = mutants - killed;

      if (mutants > 0) {
        data.push({ name: 'Mutants Killed', value: killed, fill: '#10b981' });
        if (survived > 0) {
          data.push({ name: 'Mutants Survived', value: survived, fill: '#f59e0b' });
        }
      } else {
        data.push({ name: 'No KLEEMA Data', value: 1, fill: '#9ca3af' });
      }
    } else if (output.includes('TracerX') || output.includes('dynamic symbolic execution')) {
      const constraintMatch = output.match(/constraints?\s*=?\s*(\d+)/i);
      const branchMatch = output.match(/branch\w*\s*=?\s*(\d+)/i);
      
      const constraints = parseInt(constraintMatch?.[1] || '0');
      const branches = parseInt(branchMatch?.[1] || '0');

      if (constraints > 0 || branches > 0) {
        if (constraints > 0) {
          data.push({ name: 'Constraints Explored', value: constraints, fill: '#3b82f6' });
        }
        if (branches > 0) {
          data.push({ name: 'Branches Covered', value: branches, fill: '#8b5cf6' });
        }
      } else {
        data.push({ name: 'Execution Complete', value: 1, fill: '#3b82f6' });
      }
    } else {
      data.push({ name: '✅ Execution Complete', value: 1, fill: '#10b981' });
    }

    return data;
  };

  const openVisualization = (type) => {
    const output = terminalOutputs[type];
    if (!output.trim()) {
      alert('No output to visualize. Execute a tool first.');
      return;
    }

    const data = extractVisualizationData(output, type);
    setChartData(data);
    setShowVisualizationModal(true);
  };

  const downloadChart = () => {
    const chartContainer = document.getElementById('visualization-chart-container');
    const svgElement = chartContainer?.querySelector('svg');
    
    if (!svgElement) {
      alert('Chart not found');
      return;
    }

    const clonedSvg = svgElement.cloneNode(true);
    
    const bbox = svgElement.getBBox ? svgElement.getBBox() : { width: 500, height: 400 };
    const width = Math.ceil(bbox.width || 500);
    const height = Math.ceil(bbox.height || 400);
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
      }
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `chart-visualization-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    };
    
    img.onerror = () => {
      alert('Error converting chart to image. The SVG may contain cross-origin resources.');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadTerminal = (type) => {
    const output = terminalOutputs[type];
    if (!output.trim()) {
      alert('No terminal output to download');
      return;
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terminal-output-${type}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadZip = async (type) => {
    if (!currentFile) {
      alert('Please select a file first');
      return;
    }

    let folderName = '';

    if (type === 'c') {
      switch(cTool) {
        case 'Condition Satisfiability Analysis':
          folderName = 'CBMC';
          break;
        case 'DSE based Mutation Analyser':
          folderName = 'KLEEMA';
          break;
        case 'Dynamic Symbolic Execution':
          folderName = 'KLEE';
          break;
        case 'Dynamic Symbolic Execution with Pruning':
          folderName = 'TX';
          break;
        case 'Advance Code Coverage Profiler':
          folderName = 'gMCov';
          break;
        case 'Mutation Testing Profiler':
          folderName = 'gMutant';
          break;
        default:
          alert('Please select a C tool first');
          return;
      }
    } else if (type === 'solidity') {
      folderName = 'Solc';
    } else if (type === 'java') {
      folderName = 'JAVA';
    } else if (type === 'python') {
      folderName = 'python';
    }

    if (!folderName) {
      alert('Unable to determine output folder');
      return;
    }

    const inputFileName = currentFile.file.name;
    const fileBaseName = inputFileName.replace(/\.[^/.]+$/, '');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/download-zip/${folderName}?fileName=${encodeURIComponent(inputFileName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to download zip'}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileBaseName}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log(`✅ Downloaded ${fileBaseName}.zip with output from ${inputFileName}`);
    } catch (error) {
      console.error('Error downloading zip:', error);
      alert('Failed to download zip file');
    }
  };

  const samplePrograms = {
    c: {
      'Condition Satisfiability Analysis': [
        { name: 'sample.c', content: `//This Program is Problem4-REACHABILITY-TRAINING-RERS18.c
#include <stdio.h>
#define BOUND 4
int kappa;

int input,output;
#include <assert.h>
#include <math.h>
#include <stdlib.h>

int cf = 1;
int a1631914830 = 4;
int a653455892 = 4;
int a875425738 = 7;

int calculate_output(int input) {
    if((a875425738 == 6 && (a1631914830 == 1 && cf==1))) {
        printf("POINT: 224\\n");
        cf = 0;
        printf("%d\\n", 24);
    }
}

int main() {
    int x = 5;
    calculate_output(x);
    return 0;
}
` },
        { name: 'vowel.c', content: `// C program to check if a character is a vowel or consonant
#include <stdio.h>

int main()
{
    char ch = 'A';

    // Checking if the character ch is a vowel or not.
    if (ch == 'a' || ch == 'A' || ch == 'e' || ch == 'E'
        || ch == 'i' || ch == 'I' || ch == 'o' || ch == 'O'
        || ch == 'u' || ch == 'U') {
        printf("The character %c is a vowel.\\n", ch);
    }
    else {
        printf("The character %c is a consonant.\\n", ch);
    }
    return 0;
}
` }
      ],
      'DSE based Mutation Analyser': [
        { name: 'Vp1-B2.c', content: `// Vp1-B2 Sample Program
#include<stdio.h>
#include <klee/klee.h>
#include <assert.h>

int main() {
    int x;
    klee_make_symbolic(&x, sizeof(int), "x");

    if (x > 10) {
        if (x < 5) {
            printf("Impossible path\\n");
        }
    }
    return 0;
}
` },
        { name: 'Wtest8-B2.c', content: `// Wtest8-B2 Sample Program
#include<stdio.h>
#include <klee/klee.h>
#include <assert.h>

int main() {
    int a, b;
    klee_make_symbolic(&a, sizeof(int), "a");
    klee_make_symbolic(&b, sizeof(int), "b");

    if (a > b) {
        printf("a is greater\\n");
    } else {
        printf("b is greater or equal\\n");
    }
    return 0;
}
` }
      ],
      'Dynamic Symbolic Execution': [
        { name: 'Vp1-B2.c', content: `// Vp1-B2 for KLEE
#include<stdio.h>
#include <klee/klee.h>

int main() {
    int x;
    klee_make_symbolic(&x, sizeof(int), "x");

    if (x > 10) {
        printf("x > 10\\n");
    } else {
        printf("x <= 10\\n");
    }
    return 0;
}
` },
        { name: 'Wtest8-B2.c', content: `// Wtest8-B2 for KLEE
#include<stdio.h>
#include <klee/klee.h>

int main() {
    int a, b;
    klee_make_symbolic(&a, sizeof(int), "a");
    klee_make_symbolic(&b, sizeof(int), "b");

    int result = a + b;
    if (result == 100) {
        printf("Sum is 100\\n");
    }
    return 0;
}
` }
      ],
      'Dynamic Symbolic Execution with Pruning': [
        { name: 'Vp1-B2.c', content: `// Vp1-B2 for TracerX
#include<stdio.h>
#include <klee/klee.h>

int main() {
    int x;
    klee_make_symbolic(&x, sizeof(int), "x");

    if (x > 0) {
        if (x < -5) {
            printf("Unreachable\\n");
        }
    }
    return 0;
}
` },
        { name: 'Wtest8-B2.c', content: `// Wtest8-B2 for TracerX
#include<stdio.h>
#include <klee/klee.h>

int main() {
    int x;
    klee_make_symbolic(&x, sizeof(int), "x");

    if (x > 5) printf("Branch 1\\n");
    if (x < 3) printf("Branch 2\\n");

    return 0;
}
` }
      ],
      'Advance Code Coverage Profiler': [
        { name: 'PS-Wtest10-B2.c', content: `// PS-Wtest10-B2 Sample
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Fib(10) = %d\\n", fibonacci(10));
    return 0;
}
` },
        { name: 'PS-Wtest9-B2.c', content: `// PS-Wtest9-B2 Sample
#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n = 5;
    printf("Factorial: %d\\n", factorial(n));
    return 0;
}
` }
      ],
      'Mutation Testing Profiler': [
        { name: 'PS-Wtest10-B2.c', content: `// PS-Wtest10-B2 for Mutation
#include <stdio.h>
#include <assert.h>

int max(int a, int b) {
    if (a > b) return a;
    return b;
}

int main() {
    assert(max(5, 10) == 10);
    assert(max(20, 10) == 20);
    printf("Tests passed!\\n");
    return 0;
}
` },
        { name: 'PS-Wtest9-B2.c', content: `// PS-Wtest9-B2 for Mutation
#include <stdio.h>
#include <assert.h>

int isEven(int n) {
    return (n % 2 == 0);
}

int main() {
    assert(isEven(2) == 1);
    assert(isEven(3) == 0);
    printf("Tests passed!\\n");
    return 0;
}
` }
      ]
    },
    java: {
      'JBMC': [
        { name: 'Demo.java', content: `public class Demo {
    public static void main(String[] args) {
        int x = 10;
        int y = 20;

        if (x > 0 && y > 5) {
            System.out.println("Valid");
        }

        while (x < y || y > 0) {
            x++;
        }
    }
}
` },
      ]
    },
    python: {
      'Condition Coverage Fuzzing': [
        { name: 'eight_queen.py', content: `def is_safe(board, row, col):
    for i in range(row):
        if board[i] == col or abs(board[i] - col) == abs(i - row):
            return False
    return True

def solve_n_queens(n, row=0, board=None):
    if board is None:
        board = [-1] * n

    if row == n:
        return [board[:]]

    solutions = []
    for col in range(n):
        if is_safe(board, row, col):
            board[row] = col
            solutions.extend(solve_n_queens(n, row + 1, board))

    return solutions

if __name__ == "__main__":
    solutions = solve_n_queens(4)
    print(f"Found {len(solutions)} solutions for 4-queens")
` },
      ]
    },
    solidity: {
      'VeriSol': [
        { name: 'RIAS.sol', content: `pragma solidity >=0.5.0 <0.9.0;

contract RIAS {
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    constructor(uint256 initialSupply) public {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }
}
` },
      ]
    }
  };

  const showSampleCode = (type) => {
    let tool = '';
    if (type === 'c') {
      tool = cTool;
    } else if (type === 'java') {
      tool = javaTool;
    } else if (type === 'python') {
      tool = pythonTool;
    } else if (type === 'solidity') {
      tool = solidityTool;
    }

    if (!tool) {
      alert('Please select a tool first');
      return;
    }

    const samples = samplePrograms[type]?.[tool];
    if (!samples || samples.length === 0) {
      alert('No sample programs available for this tool');
      return;
    }

    if (samples.length === 1) {
      const sample = samples[0];
      const blob = new Blob([sample.content], { type: 'text/plain' });
      const file = new File([blob], sample.name, { type: 'text/plain' });
      setCurrentFile({ type, file });
      alert(`Sample code loaded! File: ${sample.name}\nYou can now execute the command.`);
    } else {
      setSamplesList(samples);
      setSamplesListTitle(tool);
      setShowSamplesListModal(true);
    }
  };

  const selectSample = (sample) => {
    const blob = new Blob([sample.content], { type: 'text/plain' });
    const file = new File([blob], sample.name, { type: 'text/plain' });
    setCurrentFile({ type: currentTab, file });
    setShowSamplesListModal(false);
  };

  const handleToolChange = (tab, value) => {
    if (tab === 'c') setCTool(value);
    else if (tab === 'java') setJavaTool(value);
    else if (tab === 'python') setPythonTool(value);
    else setSolidityTool(value);
  };

  const handleParameterChange = (param, value) => {
    switch (param) {
      case 'cbmcBound':
        setCbmcBound(value);
        break;
      case 'kleemaValue':
        setKleemaValue(value);
        break;
      case 'gmcovVersion':
        setGmcovVersion(value);
        break;
      case 'gmcovTimebound':
        setGmcovTimebound(value);
        break;
      case 'gmutantVersion':
        setGmutantVersion(value);
        break;
      case 'gmutantTimebound':
        setGmutantTimebound(value);
        break;
      case 'solidityMode':
        setSolidityMode(value);
        break;
    }
  };

  return (
    <>
      {!isAuthChecked && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen ${!mounted ? 'bg-slate-900' : theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'} font-['Geist',system-ui,sans-serif] ${!isAuthChecked ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
      {/* Ambient background effects */}
      {mounted && theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* Header */}
      <Header />

      {mounted && (
      <div className="relative z-10 px-15">
        {/* Language Tabs */}
        <LanguageTabs 
          languages={languages}
          currentTab={currentTab}
          onTabChange={switchTab}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 flex-1 overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="space-y-1 overflow-auto md:order-1 order-1" style={{ maxHeight: 'calc(85vh - 100px)' }}>
            {/* File Selection Card */}
            <div className={`rounded-xl shadow-sm border p-3 md:p-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} id="file-upload">
              <div className="flex items-center mb-5">
                <i className="fas fa-file-upload text-blue-500 mr-3 text-xl"></i>
                <h3 className={`text-sm md:text-md font-bold md:text-xl ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>File Selection</h3>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentFile?.type === currentTab ? currentFile.file.name : ''}
                    readOnly
                    placeholder={`Select ${currentTab} file...`}
                    className={`flex-1 px-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-300 text-black placeholder-slate-500'}`}
                  />
                  <button
                    onClick={() => browseFile(currentTab)}
                    className="bg-blue-600 text-white px-1 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-folder-open mr-2"></i>Browse
                  </button>
                </div>
                <input
                  ref={fileInputRefs[currentTab]}
                  type="file"
                  accept={currentTab === 'solidity' ? '.sol' : currentTab === 'java' ? '.java' : currentTab === 'python' ? '.py' : '.c'}
                  onChange={(e) => handleFileSelect(e, currentTab)}
                  className="hidden"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => viewFile(currentTab)}
                    className="flex-1 py-4 bg-green-600 text-white px-1 py-1 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <i className="fas fa-eye mr-2"></i>View File
                  </button>
                  <button
                    onClick={() => executeCommand(currentTab)}
                    disabled={loading}
                    id="execute-btn"
                    className="flex-1 bg-purple-600 text-white px-1 py-1 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Running...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play mr-2"></i>Execute
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tool Selection Card */}
            <div className={`rounded-xl shadow-sm border p-3 md:p-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} id="tool-config-section">
              <div className="flex items-center mb-2">
                <i className="fas fa-tools text-blue-500 mr-3 text-xl"></i>
                <h3 className={`text-sm md:text-md font-bold md:text-2xl ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Tool Configuration</h3>
              </div>
              <div className="space-y-2">
                <div id="tool-select">
                  <label className={`block text-xs md:text-md font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Security Tool:</label>
                  <select
                    value={currentTab === 'c' ? cTool : currentTab === 'java' ? javaTool : currentTab === 'python' ? pythonTool : solidityTool}
                    onChange={(e) => {
                      if (currentTab === 'c') setCTool(e.target.value);
                      else if (currentTab === 'java') setJavaTool(e.target.value);
                      else if (currentTab === 'python') setPythonTool(e.target.value);
                      else setSolidityTool(e.target.value);
                    }}
                    className={`w-full px-1 py-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-black'}`}
                  >
                    <option value="">Select a tool</option>
                    {currentTab === 'c' && (
                      <>
                        <option value="Condition Satisfiability Analysis">Condition Satisfiability Analysis</option>
                        <option value="DSE based Mutation Analyser">DSE based Mutation Analyser</option>
                        <option value="Dynamic Symbolic Execution">Dynamic Symbolic Execution</option>
                        <option value="Dynamic Symbolic Execution with Pruning">Dynamic Symbolic Execution with Pruning</option>
                        <option value="Advance Code Coverage Profiler">Advance Code Coverage Profiler</option>
                        <option value="Mutation Testing Profiler">Mutation Testing Profiler</option>
                      </>
                    )}
                    {currentTab === 'java' && (
                      <option value="JBMC">JBMC - Java Bounded Model Checker</option>
                    )}
                    {currentTab === 'python' && (
                      <option value="Condition Coverage Fuzzing">Condition Coverage Fuzzing</option>
                    )}
                    {currentTab === 'solidity' && (
                      <option value="VeriSol">VeriSol - Smart Contract Verifier</option>
                    )}
                  </select>
                </div>

                <button
                  onClick={() => showSampleCode(currentTab)}
                  className="w-full bg-orange-600 py-4 text-white px-1 py-1 rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-file-code mr-2"></i>Load Sample Code
                </button>

                {/* Tool-specific parameters */}
                {currentTab === 'c' && cTool === 'Condition Satisfiability Analysis' && (
                  <div className={`p-1 rounded-lg border transition-all ${mounted && theme === 'dark' ? 'bg-slate-700 border-slate-600' : mounted && theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-slate-700'}`} id="tool-params">
                    <label className={`block text-sm font-medium mb-2 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Unwind Bound:</label>
                    <input
                      type="number"
                      value={cbmcBound}
                      onChange={(e) => setCbmcBound(e.target.value)}
                      placeholder="Enter unwind bound value"
                      className={`w-full px-1 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${mounted && theme === 'dark' ? 'bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400' : mounted && theme === 'light' ? 'bg-white border-slate-300 text-black placeholder-slate-500' : 'bg-slate-600 text-slate-100'}`}
                    />
                  </div>
                )}

                {currentTab === 'c' && cTool === 'DSE based Mutation Analyser' && (
                  <div className={`p-4 rounded-lg border transition-all ${mounted && theme === 'dark' ? 'bg-slate-700 border-slate-600' : mounted && theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-slate-700'}`}>
                    <label className={`block text-sm font-medium mb-2 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Tool Value:</label>
                    <select
                      value={kleemaValue}
                      onChange={(e) => setKleemaValue(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${mounted && theme === 'dark' ? 'bg-slate-600 border-slate-500 text-slate-100' : mounted && theme === 'light' ? 'bg-white border-slate-300 text-black' : 'bg-slate-600 text-slate-100'}`}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                )}

                {currentTab === 'c' && (cTool === 'Advance Code Coverage Profiler' || cTool === 'Mutation Testing Profiler') && (
                  <div className={`p-4 rounded-lg border space-y-3 transition-all ${mounted && theme === 'dark' ? 'bg-slate-700 border-slate-600' : mounted && theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-slate-700'}`}>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Version:</label>
                      <select
                        value={cTool === 'Advance Code Coverage Profiler' ? gmcovVersion : gmutantVersion}
                        onChange={(e) => cTool === 'Advance Code Coverage Profiler' ? setGmcovVersion(e.target.value) : setGmutantVersion(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${mounted && theme === 'dark' ? 'bg-slate-600 border-slate-500 text-slate-100' : mounted && theme === 'light' ? 'bg-white border-slate-300 text-black' : 'bg-slate-600 text-slate-100'}`}
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Time Bound (seconds):</label>
                      <input
                        type="number"
                        value={cTool === 'Advance Code Coverage Profiler' ? gmcovTimebound : gmutantTimebound}
                        onChange={(e) => cTool === 'Advance Code Coverage Profiler' ? setGmcovTimebound(e.target.value) : setGmutantTimebound(e.target.value)}
                        placeholder="Enter time bound"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${mounted && theme === 'dark' ? 'bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400' : mounted && theme === 'light' ? 'bg-white border-slate-300 text-black placeholder-slate-500' : 'bg-slate-600 text-slate-100'}`}
                      />
                    </div>
                  </div>
                )}

                {currentTab === 'solidity' && solidityTool === 'VeriSol' && (
                  <div className={`p-4 rounded-lg border transition-all ${mounted && theme === 'dark' ? 'bg-slate-700 border-slate-600' : mounted && theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-slate-700'}`}>
                    <label className={`block text-sm font-medium mb-2 ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Verification Mode:</label>
                    <select
                      value={solidityMode}
                      onChange={(e) => setSolidityMode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all ${mounted && theme === 'dark' ? 'bg-slate-600 border-slate-500 text-slate-100' : mounted && theme === 'light' ? 'bg-white border-slate-300 text-black' : 'bg-slate-600 text-slate-100'}`}
                    >
                      <option value="bmc">Bounded Model Checker</option>
                      <option value="chc">Constrained Horn Clauses</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Terminal Output (scrollable only) */}
          <div className={`rounded-xl shadow-sm border overflow-scroll flex flex-col transition-all md:order-2 order-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} id="terminal-output" style={{ height: 'calc(96vh - 100px)' }}>
            <div className={`p-3 md:p-6 border-b flex justify-between items-center flex-shrink-0 flex-col md:flex-row gap-3 md:gap-0 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center">
                <i className="fas fa-terminal text-green-500 mr-3 text-lg md:text-xl"></i>
                <h3 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Terminal Output</h3>
              </div>
              <div className="flex space-x-2 md:space-x-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                <button
                  onClick={() => downloadTerminal(currentTab)}
                  className="flex-1 md:flex-initial bg-blue-600 text-white px-2 md:px-6 py-1 md:py-5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-md"
                >
                  <i className="fas fa-download mr-1 md:mr-2"></i><span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => openVisualization(currentTab)}
                  className="flex-1 md:flex-initial bg-purple-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm"
                >
                  <i className="fas fa-chart-pie mr-1 md:mr-2"></i><span className="hidden sm:inline">Visualize</span>
                </button>
                <button
                  onClick={() => downloadZip(currentTab)}
                  className="flex-1 md:flex-initial bg-green-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm"
                >
                  <i className="fas fa-file-archive mr-1 md:mr-2"></i><span className="hidden sm:inline">ZIP</span>
                </button>
                <button
                  onClick={() => clearTerminal(currentTab)}
                  className="flex-1 md:flex-initial bg-gray-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm"
                >
                  <i className="fas fa-trash mr-1 md:mr-2"></i><span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className={`rounded-lg border shadow-inner overflow-hidden transition-all ${mounted && theme === 'dark' ? 'bg-slate-950 border-slate-700' : mounted && theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950'}`} style={{ height: '700px' }}>
                <div className="p-4 h-full overflow-y-auto">
                  <pre className={`font-mono text-sm whitespace-pre-wrap leading-relaxed ${mounted && theme === 'dark' ? 'text-green-400' : mounted && theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                    {terminalOutputs[currentTab] || 'Terminal output will appear here...\n\nReady to execute security analysis tools.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* File Viewer Modal */}
      <FileViewerModal 
        isOpen={showFileViewer}
        fileContent={fileContent}
        onClose={closeFileViewer}
      />

      {/* Samples List Modal */}
      <SamplesListModal 
        isOpen={showSamplesListModal}
        samples={samplesList}
        title={samplesListTitle}
        onSelect={selectSample}
        onClose={() => setShowSamplesListModal(false)}
      />

      {/* Visualization Modal */}
      <VisualizationModal 
        isOpen={showVisualizationModal}
        chartData={chartData}
        onClose={() => setShowVisualizationModal(false)}
        onDownload={downloadChart}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </>
  );
}

export default function TrustInnPage() {
  return <ToolsContent />;
}
