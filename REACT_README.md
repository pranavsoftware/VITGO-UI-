# VITGO React Component Library

A comprehensive React component library for the VITGO Transportation Management System, built with TypeScript and modern CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/pranavsoftware/VITGO-UI-.git
cd VITGO-UI-

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── admin/            # Admin-specific components
│   │   ├── Navigation.tsx
│   │   ├── StatsCard.tsx
│   │   └── index.ts
│   ├── driver/           # Driver portal components (planned)
│   ├── student/          # Student portal components (planned)
│   ├── parent/           # Parent portal components (planned)
│   └── index.ts
├── hooks/                # Custom React hooks
├── services/             # API services
├── utils/                # Utility functions
├── App.tsx               # Main application component
└── index.tsx             # Application entry point
```

## 🎨 Component Library

### Common Components

#### Button
Versatile button component with multiple variants and states.

```tsx
import { Button } from './components/common';

<Button variant="primary" size="large" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `disabled`: boolean

#### Card
Flexible container component for content grouping.

```tsx
import { Card } from './components/common';

<Card variant="elevated" hoverable onClick={handleClick}>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

#### Input
Form input component with validation support.

```tsx
import { Input } from './components/common';

<Input
  label="Student ID"
  placeholder="Enter student ID"
  error={errors.studentId}
  onChange={handleChange}
/>
```

#### Modal
Modal dialog component for overlays and forms.

```tsx
import { Modal } from './components/common';

<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  title="Student Details"
  size="medium"
>
  <form>...</form>
</Modal>
```

### Admin Components

#### Navigation
Sidebar navigation for admin portal.

```tsx
import { Navigation } from './components/admin';

<Navigation 
  items={navigationItems}
  logo={<Logo />}
  userInfo={userInfo}
  onItemClick={handleNavigation}
/>
```

#### StatsCard
Statistical display card with trends and icons.

```tsx
import { StatsCard } from './components/admin';

<StatsCard
  title="Total Students"
  value="2,847"
  trend={{ value: 12, isPositive: true }}
  color="primary"
/>
```

## 🎯 Features

### Design System
- **CSS Variables**: Consistent theming with CSS custom properties
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Modern Styling**: Clean, professional UI following modern design principles
- **Accessibility**: WCAG compliant components with proper ARIA attributes

### Component Features
- **TypeScript Support**: Full type safety and IntelliSense
- **Modular Architecture**: Import only what you need
- **Consistent API**: Standardized props across components
- **Theme Support**: Customizable design tokens
- **Animation**: Smooth transitions and micro-interactions

### Development Experience
- **Hot Reload**: Instant feedback during development
- **Error Boundaries**: Graceful error handling
- **Development Tools**: React DevTools integration
- **Linting**: ESLint configuration for code quality

## 🛠 Available Scripts

```bash
# Development
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App

# Utilities
npm run serve      # Serve production build locally
```

## 🌈 Theming

The component library uses CSS custom properties for theming:

```css
:root {
  --vitgo-primary: #6366f1;
  --vitgo-success: #10b981;
  --vitgo-danger: #ef4444;
  --vitgo-radius-md: 0.375rem;
  --vitgo-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔧 Technologies Used

- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **CSS3**: Modern CSS with custom properties
- **React Scripts**: Zero-config build tools
- **ESLint**: Code quality and consistency

## 🚦 Development Guidelines

### Component Development
1. Use TypeScript for all components
2. Follow the established naming conventions
3. Include proper prop types and interfaces
4. Add CSS classes with `vitgo-` prefix
5. Ensure responsive design
6. Include hover and focus states

### Styling Guidelines
1. Use CSS custom properties for theming
2. Follow BEM-like naming: `vitgo-component__element--modifier`
3. Mobile-first responsive design
4. Consistent spacing using design tokens
5. Smooth transitions for interactive elements

## 📦 Production Build

```bash
npm run build
```

Creates optimized production files in the `build/` directory.

## 🌟 Roadmap

### Phase 1 (Current)
- ✅ Core component library setup
- ✅ Admin navigation and stats components
- ✅ Basic form components (Button, Input, Modal)
- ✅ Responsive design system

### Phase 2 (Upcoming)
- 🔄 Driver portal components
- 🔄 Student portal components  
- 🔄 Parent portal components
- 🔄 Advanced form components (Select, DatePicker, etc.)

### Phase 3 (Future)
- 📊 Chart and visualization components
- 🗺️ Map integration components
- 🔔 Notification system
- 📱 Mobile app components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-component`
3. Make your changes and commit: `git commit -m 'Add new component'`
4. Push to the branch: `git push origin feature/new-component`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the VITGO Development Team for VIT University's transportation management system.

---

For more information or support, please contact the development team or open an issue in the repository.
