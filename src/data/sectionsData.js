export const sectionsData = [
  {
    id: 'network-playbook',
    title: 'Network Playbook',
    description: 'Comprehensive network security testing methodologies',
    modules: [
      {
        id: 'reconnaissance',
        title: 'Reconnaissance',
        description: 'Information gathering and target analysis',
        topics: [
          { id: 'passive-recon', title: 'Passive Reconnaissance', content: 'OSINT, Google dorking, social media analysis' },
          { id: 'active-recon', title: 'Active Reconnaissance', content: 'Port scanning, service enumeration, network mapping' },
          { id: 'dns-enumeration', title: 'DNS Enumeration', content: 'Zone transfers, subdomain discovery, record analysis' }
        ]
      },
      {
        id: 'scanning',
        title: 'Scanning & Enumeration',
        description: 'Vulnerability assessment and service analysis',
        topics: [
          { id: 'port-scanning', title: 'Port Scanning Techniques', content: 'Nmap techniques, timing, evasion methods' },
          { id: 'service-enumeration', title: 'Service Enumeration', content: 'Banner grabbing, version detection' },
          { id: 'vulnerability-scanning', title: 'Vulnerability Scanning', content: 'Automated vs manual testing methodologies' }
        ]
      }
    ]
  },
  {
    id: 'active-directory',
    title: 'Active Directory',
    description: 'Windows domain penetration testing',
    modules: [
      {
        id: 'ad-basics',
        title: 'AD Fundamentals',
        description: 'Understanding Active Directory structure',
        topics: [
          { id: 'ad-structure', title: 'AD Structure Overview', content: 'Domains, forests, organizational units' },
          { id: 'authentication', title: 'Authentication Mechanisms', content: 'Kerberos, NTLM, LDAP authentication' },
          { id: 'permissions', title: 'Permissions & Rights', content: 'ACLs, delegation, privilege escalation' }
        ]
      },
      {
        id: 'ad-attacks',
        title: 'Attack Vectors',
        description: 'Common AD exploitation techniques',
        topics: [
          { id: 'pass-the-hash', title: 'Pass the Hash', content: 'Credential theft and reuse techniques' },
          { id: 'kerberoasting', title: 'Kerberoasting', content: 'Service account ticket extraction' },
          { id: 'dcsync', title: 'DCSync Attack', content: 'Domain controller replication abuse' }
        ]
      }
    ]
  },
  {
    id: 'enumeration',
    title: 'Enumeration',
    description: 'System and service enumeration techniques',
    modules: [
      {
        id: 'system-enumeration',
        title: 'System Enumeration',
        description: 'Host-based information gathering',
        topics: [
          { id: 'linux-enumeration', title: 'Linux Enumeration', content: 'User accounts, processes, services, cron jobs' },
          { id: 'windows-enumeration', title: 'Windows Enumeration', content: 'Users, groups, policies, registry' },
          { id: 'privilege-escalation', title: 'Privilege Escalation', content: 'Kernel exploits, misconfigurations, credentials' }
        ]
      },
      {
        id: 'network-enumeration',
        title: 'Network Enumeration',
        description: 'Network-level information gathering',
        topics: [
          { id: 'snmp-enumeration', title: 'SNMP Enumeration', content: 'Community strings, MIB walking' },
          { id: 'smb-enumeration', title: 'SMB Enumeration', content: 'Share enumeration, null sessions' },
          { id: 'database-enumeration', title: 'Database Enumeration', content: 'MySQL, PostgreSQL, MongoDB discovery' }
        ]
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Essential cybersecurity tools and their usage',
    modules: [
      {
        id: 'network-tools',
        title: 'Network Tools',
        description: 'Network analysis and testing tools',
        topics: [
          { id: 'nmap', title: 'Nmap', content: 'Port scanning, service detection, script engine' },
          { id: 'wireshark', title: 'Wireshark', content: 'Packet capture, protocol analysis' },
          { id: 'metasploit', title: 'Metasploit Framework', content: 'Exploitation framework, payload generation' }
        ]
      },
      {
        id: 'web-tools',
        title: 'Web Application Tools',
        description: 'Web security testing tools',
        topics: [
          { id: 'burp-suite', title: 'Burp Suite', content: 'Web proxy, scanner, intruder tool' },
          { id: 'sqlmap', title: 'SQLMap', content: 'SQL injection detection and exploitation' },
          { id: 'nikto', title: 'Nikto', content: 'Web server vulnerability scanner' }
        ]
      }
    ]
  },
  {
    id: 'cpts-journey',
    title: 'CPTS Journey',
    description: 'Certified Penetration Testing Specialist path',
    modules: [
      {
        id: 'cpts-basics',
        title: 'CPTS Fundamentals',
        description: 'Foundation concepts for CPTS certification',
        topics: [
          { id: 'exam-overview', title: 'Exam Overview', content: 'Format, duration, passing requirements' },
          { id: 'study-plan', title: 'Study Plan', content: 'Recommended timeline and resources' },
          { id: 'practice-labs', title: 'Practice Labs', content: 'Hands-on lab environments and exercises' }
        ]
      },
      {
        id: 'cpts-advanced',
        title: 'Advanced Topics',
        description: 'Complex scenarios and techniques',
        topics: [
          { id: 'advanced-exploitation', title: 'Advanced Exploitation', content: 'Custom exploits, chaining techniques' },
          { id: 'post-exploitation', title: 'Post-Exploitation', content: 'Persistence, lateral movement, data exfiltration' },
          { id: 'report-writing', title: 'Report Writing', content: 'Professional penetration testing reports' }
        ]
      }
    ]
  },
  {
    id: 'cheatsheets',
    title: 'Cheatsheets',
    description: 'Quick reference guides and commands',
    modules: [
      {
        id: 'command-cheatsheets',
        title: 'Command References',
        description: 'Essential commands and one-liners',
        topics: [
          { id: 'linux-commands', title: 'Linux Commands', content: 'Essential Linux commands for pentesters' },
          { id: 'windows-commands', title: 'Windows Commands', content: 'PowerShell and CMD essentials' },
          { id: 'network-commands', title: 'Network Commands', content: 'Netcat, curl, wget, and networking tools' }
        ]
      },
      {
        id: 'technique-cheatsheets',
        title: 'Technique References',
        description: 'Quick technique guides',
        topics: [
          { id: 'privilege-escalation-cheatsheet', title: 'Privilege Escalation', content: 'Common privesc vectors and commands' },
          { id: 'pivoting-cheatsheet', title: 'Pivoting Techniques', content: 'SSH tunneling, proxychains, port forwarding' },
          { id: 'forensics-cheatsheet', title: 'Forensics Basics', content: 'Evidence collection and analysis basics' }
        ]
      }
    ]
  },
  {
    id: 'thinking-notes',
    title: 'Thinking Notes',
    description: 'Methodology and strategic thinking',
    modules: [
      {
        id: 'methodology',
        title: 'Testing Methodology',
        description: 'Structured approaches to penetration testing',
        topics: [
          { id: 'ptes-methodology', title: 'PTES Framework', content: 'Penetration Testing Execution Standard' },
          { id: 'cyber-kill-chain', title: 'Cyber Kill Chain', content: 'Attack lifecycle analysis' },
          { id: 'mitre-attck', title: 'MITRE ATT&CK', content: 'Tactics, techniques, and procedures' }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategic Thinking',
        description: 'High-level approach to security testing',
        topics: [
          { id: 'threat-modeling', title: 'Threat Modeling', content: 'Identifying and analyzing threats' },
          { id: 'risk-assessment', title: 'Risk Assessment', content: 'Evaluating and prioritizing risks' },
          { id: 'report-strategy', title: 'Reporting Strategy', content: 'Effective communication of findings' }
        ]
      }
    ]
  }
];
