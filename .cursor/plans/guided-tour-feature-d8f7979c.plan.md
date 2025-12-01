<!-- d8f7979c-16d0-4532-8734-b0785e5b933d 62c8dec5-ee5c-46f9-9cd0-8bbcbafa0813 -->
# Add Interactive Guided Tour to Employees Pages

## Overview

Create a dismissible guided tour feature that highlights key UI elements on both the employees selection page and employee detail page with tooltips, providing comprehensive "how to use" instructions for each section.

## Implementation Steps

### 1. Create Tour Component

Create [`src/components/GuidedTour.jsx`](src/components/GuidedTour.jsx) and [`src/components/GuidedTour.css`](src/components/GuidedTour.css)

- Build a reusable tour system with overlay, spotlight, and tooltip
- Support multiple tour steps with navigation (Next, Previous, Skip, Finish)
- Position tooltips dynamically based on highlighted element
- Handle dismissible state (save to localStorage)
- Provide API for defining tour steps (element selector, title, description, position)
- Support conditional steps based on UI state (e.g., only show subtabs when parent tab is active)

### 2. Define Tour Steps for Employees Selection Page

In the tour component or as configuration:

- Step 1: Highlight employee cards - "Select an AI employee to get started. Click any card to open their detail page"
- Step 2: Point to "Create Custom" card - "Create your own custom AI employee tailored to your specific needs"
- Step 3: Point to "Organization Settings" button - "Configure organization-wide settings and preferences"
- Step 4: Show preview of employee detail page features (Chat, Educate/Train, Skillset tabs)

### 3. Integrate Tour into EmployeeSelection

Modify [`src/components/EmployeeSelection.jsx`](src/components/EmployeeSelection.jsx):

- Add "Help" or "?" button in the header navigation
- Import and render GuidedTour component
- Pass tour steps configuration
- Manage tour state (show/hide)
- Add data attributes or IDs to elements that need highlighting

### 4. Style the Tour

In [`src/components/GuidedTour.css`](src/components/GuidedTour.css):

- Dark overlay with spotlight effect on highlighted elements
- Modern tooltip design matching existing design system
- Smooth transitions and animations
- Responsive positioning for different screen sizes
- Z-index management to appear above all content

### 5. Add Comprehensive Tour to Employee Detail Page

Modify [`src/components/EmployeeDetail.jsx`](src/components/EmployeeDetail.jsx):

- Add "?" help button in the detail header (next to Settings button)
- Define comprehensive tour steps for the detail page covering all sections with detailed "how to use" instructions:
- **Step 1**: Highlight sidebar tabs - "Navigate between three main sections: Chat, Educate/Train, and Skillset. Click any tab to switch views"
- **Step 2**: Highlight Chat tab - "Chat with your AI employee to get work done. Ask questions, give instructions, and collaborate in real-time. Type your message and press Enter to send"
- **Step 3**: Highlight Educate/Train tab - "Train your employee by uploading knowledge or creating smart notes. This helps the AI understand your specific needs and context"
- **Step 4**: Highlight Smart Note Maker sub-tab (when Educate tab is active) - "Create structured notes to teach your employee specific information. Use this to add knowledge that the AI can reference later. Click 'Create Note' to get started"
- **Step 5**: Highlight Upload Documents sub-tab (when Educate tab is active) - "Upload PDFs, documents, or files for your employee to learn from. The AI will analyze and extract knowledge from these files. Drag and drop or click to browse files"
- **Step 6**: Highlight Skillset tab - "Enable and configure skills to give your employee specific capabilities like meeting assistance, email management, or task tracking. Skills extend your employee's functionality"
- **Step 7**: Highlight Skills grid (when Skillset tab is active) - "Browse available skills organized by category. Toggle them on/off using the switch, and click any skill card to configure its settings and behavior"
- **Step 8**: Highlight skill filter buttons (when Skillset tab is active) - "Filter skills by status: view all skills, only enabled ones, or only disabled ones. This helps you manage your employee's capabilities"
- **Step 9**: Highlight Settings button - "Access employee settings to customize behavior, preferences, and advanced configurations. Configure how this employee responds and operates"
- **Step 10**: Highlight Back button - "Return to the employees list to switch between different AI employees or create new ones"
- Integrate GuidedTour component with employee-specific steps
- Ensure tour adapts to current tab state (e.g., only show Educate subtabs when Educate tab is active, handle dynamic content visibility)
- Add data attributes or refs to elements that need highlighting for reliable element selection

### 6. Create Tour Step Configurations

Create [`src/data/tourSteps.js`](src/data/tourSteps.js) to centralize tour configurations:

- `employeeSelectionTour` - steps for the employees selection page
- `employeeDetailTour` - steps for the employee detail page
- Easy to maintain and extend tour content
- Support conditional logic for steps that depend on UI state

## Key Files to Modify

- [`src/components/EmployeeSelection.jsx`](src/components/EmployeeSelection.jsx) - Add help button and tour integration
- [`src/components/EmployeeSelection.css`](src/components/EmployeeSelection.css) - Help button styling
- [`src/components/EmployeeDetail.jsx`](src/components/EmployeeDetail.jsx) - Add help button and comprehensive tour for detail page
- [`src/components/EmployeeDetail.css`](src/components/EmployeeDetail.css) - Help button styling
- New: [`src/components/GuidedTour.jsx`](src/components/GuidedTour.jsx) - Reusable tour component
- New: [`src/components/GuidedTour.css`](src/components/GuidedTour.css) - Tour styles
- New: [`src/data/tourSteps.js`](src/data/tourSteps.js) - Tour step configurations

## Technical Approach

- Use React portals for overlay rendering
- Calculate element positions with `getBoundingClientRect()`
- Store tour completion state in localStorage (separate keys for each page)
- Make tour restartable from help button
- Ensure accessibility (keyboard navigation, ARIA labels)
- Handle edge cases: elements not found, dynamic content loading, responsive layouts
- Support conditional step rendering based on current UI state (active tabs, visible elements)

### To-dos

- [ ] Create GuidedTour component with overlay, spotlight, and tooltip