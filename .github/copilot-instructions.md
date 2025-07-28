# Copilot Instructions - BiblioTech

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
BiblioTech is a digital library management platform for schools built with Next.js, PostgreSQL, and Tailwind CSS.

## Key Requirements
- Use JavaScript (not TypeScript) for all components
- Follow Tailwind CSS patterns for styling with responsive design
- Use App Router (Next.js 13+) file structure
- Implement authentication for students and administrators
- Create services for API consumption using Axios
- Follow government system design patterns (clean, professional UI)
- Ensure mobile-responsive design
- Support Portuguese language throughout the application

## Main Entities
- **Livro**: Books with fields for id, name, genre, quantities, author, availability
- **Aluno**: Students with fields for id, registration, password, name, course, reading stats
- **Admin**: Administrators with id, name, password
- **Pendências**: Overdue book records with student and book information

## Architecture Guidelines
- Place API service files in `/src/services/` directory
- Use PostgreSQL with Docker for database
- Implement proper error handling and validation
- Follow component-based architecture
- Use environment variables for configuration
- Maintain clean code with proper documentation

## UI/UX Standards
- Design should resemble Ceará state government systems
- Use modern, clean interfaces
- Implement proper loading states and error messages
- Ensure accessibility and responsiveness
- Use consistent color palette aligned with EEEPs visual identity
