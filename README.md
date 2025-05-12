# Kodigo Eleksyon 2025

## Project Overview

**Kodigo Eleksyon 2025** is a ballot builder application for the 2025 Philippine elections. The app allows voters to:

- Create personalized Kodigo ballots (voting guides) for specific cities and municipalities
- Select candidates for various positions (national and local)
- Preview and print their selections to use on election day
- Access national candidates (Senators and Party List) regardless of location

This project was partly built using [Lovable](https://lovable.dev), a vibe coding platform.

Currently supported locations:
- Cainta, Rizal
- Cebu City
- Makati City
- National candidates only
- Taguig City
- Taytay, Rizal
- Zamboanga City (main)

## Features

- **City-specific ballot builders**: Customized for various Philippine cities
- **Candidate selection**: Easy-to-use interface for selecting candidates by position
- **Ballot preview**: Generate a printable ballot with selected candidates
- **Progress tracking**: Visual indicators of ballot completion
- **Responsive design**: Works on mobile devices and desktops
- **Accessibility**: Screen reader support and keyboard navigation
- **Analytics**: Anonymous usage tracking to improve the app

## Tech Stack

This project is built with:
- **Vite**: For fast development and optimized builds
- **TypeScript**: For type safety and better developer experience
- **React**: UI library for building component-based interfaces
- **React Router**: For navigation between pages
- **shadcn/ui**: Component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Posthog**: For analytics tracking
- **React Query**: For data fetching and management

## Project Setup

To run this project locally:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd kodigoeleksyon2025

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Deployment

The app is deployed on Netlify. You can deploy it by:
1. Opening [Lovable](https://lovable.dev/projects/a9279b5a-adbf-4dcc-bac6-8c5f7a44ab84)
2. Clicking on Share -> Publish

## Contact

If you want a similar app for your city or have other inquiries, please email:
[aljhoenilw@gmail.com](mailto:aljhoenilw+kodigoeleksyon2025@gmail.com)

## Custom Domains

Custom domains are not directly supported by the platform. If you want to deploy this project under your own domain, we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
