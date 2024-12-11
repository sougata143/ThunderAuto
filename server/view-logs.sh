#!/bin/bash

# Ensure the script is executable
# chmod +x view-logs.sh

# Define log directory
LOG_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/logs"

# Check if logs directory exists
if [ ! -d "$LOG_DIR" ]; then
    echo "❌ Logs directory does not exist: $LOG_DIR"
    exit 1
fi

# Function to display log files
display_logs() {
    local log_type=$1
    local log_file="$LOG_DIR/${log_type}.log"

    if [ ! -f "$log_file" ]; then
        echo "❌ Log file not found: $log_file"
        return 1
    fi

    echo "🔍 Displaying ${log_type} logs from $log_file"
    echo "-------------------------------------------"
    
    # Tail the last 500 lines, with color and line numbers
    tail -n 500 "$log_file" | grep -E '(❌|✅|🚨|🔍)' | nl
}

# Main script
case "$1" in
    "error")
        display_logs "error"
        ;;
    "debug")
        display_logs "debug"
        ;;
    "combined")
        display_logs "combined"
        ;;
    *)
        echo "Usage: $0 {error|debug|combined}"
        echo "Displays the last 500 lines of the specified log type"
        exit 1
        ;;
esac
