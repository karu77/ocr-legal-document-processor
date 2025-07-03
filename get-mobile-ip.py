#!/usr/bin/env python3
"""
Get Mobile IP Address - OCR Legal Document Processor
Simple utility to help users find their IP address for mobile testing.
"""

import socket
import platform
import subprocess
import sys

class Colors:
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    WHITE = '\033[37m'
    END = '\033[0m'

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "Unable to determine"

def get_all_ips():
    """Get all available IP addresses"""
    try:
        if platform.system().lower() == 'windows':
            result = subprocess.run(['ipconfig'], capture_output=True, text=True)
            return result.stdout
        else:
            result = subprocess.run(['ifconfig'], capture_output=True, text=True)
            return result.stdout
    except Exception:
        return "Unable to get network information"

def print_banner():
    """Print welcome banner"""
    print(f"{Colors.PURPLE}{Colors.BOLD}")
    print("╔" + "═" * 60 + "╗")
    print("║" + " " * 60 + "║")
    print("║" + "  📱 MOBILE IP FINDER - OCR PROCESSOR  ".center(60) + "║")
    print("║" + " " * 60 + "║")
    print("╚" + "═" * 60 + "╝")
    print(f"{Colors.END}\n")

def main():
    """Main entry point"""
    print_banner()
    
    # Get local IP
    local_ip = get_local_ip()
    
    print(f"{Colors.GREEN}🌐 Your IP Address for Mobile Testing:{Colors.END}")
    print(f"{Colors.CYAN}  {local_ip}{Colors.END}")
    print()
    
    if local_ip != "Unable to determine":
        print(f"{Colors.WHITE}📱 Mobile Access URLs:{Colors.END}")
        print(f"{Colors.CYAN}  • Frontend: http://{local_ip}:3000{Colors.END}")
        print(f"{Colors.CYAN}  • Backend:  http://{local_ip}:5000{Colors.END}")
        print()
        
        print(f"{Colors.YELLOW}📋 Instructions for Mobile Testing:{Colors.END}")
        print(f"{Colors.WHITE}1. Make sure your mobile device is on the same WiFi network{Colors.END}")
        print(f"{Colors.WHITE}2. Open your mobile browser{Colors.END}")
        print(f"{Colors.WHITE}3. Navigate to: http://{local_ip}:3000{Colors.END}")
        print(f"{Colors.WHITE}4. For PWA: Tap menu → 'Add to Home Screen'{Colors.END}")
        print()
        
        print(f"{Colors.GREEN}✨ Pro Tips:{Colors.END}")
        print(f"{Colors.CYAN}  • Install as PWA for native app experience{Colors.END}")
        print(f"{Colors.CYAN}  • Test offline mode by disabling WiFi after loading{Colors.END}")
        print(f"{Colors.CYAN}  • Use touch gestures for optimal mobile experience{Colors.END}")
        print(f"{Colors.CYAN}  • Check responsive design on different screen sizes{Colors.END}")
    else:
        print(f"{Colors.RED}❌ Could not determine IP address automatically.{Colors.END}")
        print(f"{Colors.WHITE}Try these methods:{Colors.END}")
        print()
        
        if platform.system().lower() == 'windows':
            print(f"{Colors.CYAN}Windows - Run in Command Prompt:{Colors.END}")
            print(f"{Colors.WHITE}  ipconfig{Colors.END}")
            print(f"{Colors.WHITE}  Look for 'IPv4 Address' under your network adapter{Colors.END}")
        else:
            print(f"{Colors.CYAN}Mac/Linux - Run in Terminal:{Colors.END}")
            print(f"{Colors.WHITE}  ifconfig{Colors.END}")
            print(f"{Colors.WHITE}  Look for 'inet' address (usually starts with 192.168.x.x){Colors.END}")
        
        print()
        print(f"{Colors.WHITE}Common IP ranges:{Colors.END}")
        print(f"{Colors.CYAN}  • 192.168.1.x (most home routers){Colors.END}")
        print(f"{Colors.CYAN}  • 192.168.0.x (some routers){Colors.END}")
        print(f"{Colors.CYAN}  • 10.0.0.x (some networks){Colors.END}")
    
    print()
    print(f"{Colors.PURPLE}🔥 Ready to test your mobile-optimized OCR processor!{Colors.END}")

if __name__ == '__main__':
    main() 