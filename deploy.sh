#!/bin/bash

# ERP Invoicing System - Docker Deployment Script
# This script handles building, deploying, and managing Docker containers for the application

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="sml-invoicing"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Check if .env files exist in backend and frontend
check_env_file() {
    local has_error=false

    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env file not found."
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_success "backend/.env created from .env.example. Please update with your DATABASE_URL."
            has_error=true
        else
            print_error "backend/.env.example file not found."
            has_error=true
        fi
    else
        print_success "backend/.env file exists"
    fi

    if [ ! -f "frontend/.env" ]; then
        print_warning "frontend/.env file not found (optional)."
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            print_info "frontend/.env created from .env.example"
        fi
    else
        print_success "frontend/.env file exists"
    fi

    if [ "$has_error" = true ]; then
        print_error "Please configure backend/.env with DATABASE_URL before deploying."
        exit 1
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    print_success "Docker images built successfully"
}

# Start containers
start_containers() {
    print_header "Starting Containers"
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Containers started"
}

# Stop containers
stop_containers() {
    print_header "Stopping Containers"
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Containers stopped"
}

# Remove all containers and volumes
remove_all() {
    print_header "Removing All Containers and Volumes"
    print_warning "This will delete all data. Are you sure? (yes/no)"
    read -r confirm
    if [ "$confirm" = "yes" ]; then
        docker-compose -f "$COMPOSE_FILE" down -v
        print_success "All containers and volumes removed"
    else
        print_info "Operation cancelled"
    fi
}

# View logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_header "Viewing All Logs"
        docker-compose -f "$COMPOSE_FILE" logs -f
    else
        print_header "Viewing $service Logs"
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

# Show container status
show_status() {
    print_header "Container Status"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Deploy (full cycle)
deploy() {
    print_header "Deploying Application"
    check_docker
    check_docker_compose
    check_env_file
    build_images
    stop_containers || true
    start_containers
    print_info "Waiting for services to be healthy..."
    sleep 10
    show_status
    print_success "Application deployed successfully"
    print_info "Backend: http://localhost:3004"
    print_info "Frontend: http://localhost:3003"
}

# Restart services
restart_services() {
    print_header "Restarting Services"
    docker-compose -f "$COMPOSE_FILE" restart
    print_success "Services restarted"
}

# Clean up unused Docker resources
cleanup() {
    print_header "Cleaning Up Docker Resources"
    docker system prune -f
    print_success "Cleanup completed"
}

# Show help
show_help() {
    echo "ERP Invoicing System - Docker Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy          Build and start all containers (full deployment)"
    echo "  build           Build Docker images only"
    echo "  start           Start all containers"
    echo "  stop            Stop all containers"
    echo "  restart         Restart all containers"
    echo "  status          Show container status"
    echo "  logs [SERVICE]  View logs (SERVICE: backend, frontend, mysql)"
    echo "  remove          Remove all containers and volumes (destructive)"
    echo "  cleanup         Clean up unused Docker resources"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy       # Full deployment"
    echo "  $0 logs         # View all logs"
    echo "  $0 logs backend # View backend logs only"
}

# Main script logic
main() {
    local command="${1:-help}"

    case "$command" in
        deploy)
            deploy
            ;;
        build)
            check_docker
            check_docker_compose
            build_images
            ;;
        start)
            check_docker
            check_docker_compose
            check_env_file
            start_containers
            ;;
        stop)
            check_docker
            check_docker_compose
            stop_containers
            ;;
        restart)
            check_docker
            check_docker_compose
            restart_services
            ;;
        status)
            check_docker
            check_docker_compose
            show_status
            ;;
        logs)
            check_docker
            check_docker_compose
            view_logs "$2"
            ;;
        remove)
            check_docker
            check_docker_compose
            remove_all
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
