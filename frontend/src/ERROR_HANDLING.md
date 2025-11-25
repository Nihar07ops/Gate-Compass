# Error Handling and Recovery Documentation

This document describes the error handling and recovery features implemented in the GATE COMPASS frontend application.

## Features Implemented

### 1. Error Boundaries

**Location:** `frontend/src/components/ErrorBoundary.tsx`

Error boundaries catch JavaScript errors anywhere in the component tree and display a fallback UI instead of crashing the entire application.

**Usage:**
```tsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches and logs errors in child components
- Displays user-friendly error message
- Provides "Try Again" and "Go to Home" buttons
- Shows error details in development mode

### 2. Network Error Handling with Retry Logic

**Location:** `frontend/src/utils/api.ts`

Provides automatic retry logic for failed API requests with exponential backoff.

**Usage:**
```tsx
import { api } from '../utils/api';

// GET request with retry
const response = await api.get('/api/endpoint', 
  { withCredentials: true },
  { maxRetries: 3, retryDelay: 1000 }
);

// POST request with retry
const response = await api.post('/api/endpoint', 
  { data: 'value' },
  { withCredentials: true },
  { maxRetries: 2 }
);
```

**Features:**
- Automatic retry for network errors and 5xx status codes
- Exponential backoff between retries
- Configurable retry count and delay
- Retryable status codes: 408, 429, 500, 502, 503, 504

**Error Message Extraction:**
```tsx
import { getErrorMessage } from '../utils/api';

try {
  await api.get('/api/endpoint');
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message);
}
```

### 3. Toast Notifications

**Location:** `frontend/src/contexts/ToastContext.tsx`

Provides a centralized toast notification system for success, error, warning, and info messages.

**Usage:**
```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      showSuccess('Action completed successfully!');
    } catch (error) {
      showError('Action failed. Please try again.');
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

**Features:**
- Multiple toast types: success, error, warning, info
- Auto-dismiss after configurable duration (default 6 seconds)
- Stacked toasts for multiple notifications
- Material-UI styled alerts

### 4. Session Recovery

**Location:** `frontend/src/utils/sessionRecovery.ts`

Provides utilities for saving and recovering test session state in case of browser crashes or page refreshes.

**Usage:**
```tsx
import { 
  saveSessionState, 
  loadSessionState, 
  clearSessionState,
  hasRecoverableSession 
} from '../utils/sessionRecovery';

// Save session state
saveSessionState({
  sessionId: 'session-123',
  testId: 'test-456',
  currentQuestionIndex: 5,
  answers: { 'q1': 'A', 'q2': 'B' },
  markedForReview: new Set(['q3']),
  questionTimes: { 'q1': 120, 'q2': 90 },
  startTime: Date.now(),
  lastSaved: Date.now()
});

// Load session state
const state = loadSessionState('session-123');

// Check if recoverable session exists
if (hasRecoverableSession()) {
  // Prompt user to recover
}
```

**Features:**
- Automatic localStorage persistence
- Session timeout (4 hours)
- Session ID validation
- Graceful error handling

### 5. Loading Skeletons

**Location:** `frontend/src/components/LoadingSkeleton.tsx`

Provides skeleton screens for better perceived performance during data loading.

**Usage:**
```tsx
import LoadingSkeleton from './components/LoadingSkeleton';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return <div>Content</div>;
}
```

**Available Variants:**
- `dashboard` - For dashboard pages with cards and charts
- `test` - For test-taking interface
- `results` - For results pages
- `admin` - For admin forms
- `default` - Generic skeleton

### 6. Validation Error Display

**Location:** `frontend/src/components/ValidationError.tsx`

Provides a consistent way to display validation errors in forms.

**Usage:**
```tsx
import ValidationError from './components/ValidationError';

function MyForm() {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const newErrors = [];
    if (!field1) newErrors.push('Field 1 is required');
    if (!field2) newErrors.push('Field 2 is required');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return (
    <form>
      {errors.length > 0 && <ValidationError errors={errors} />}
      {/* form fields */}
    </form>
  );
}
```

**Features:**
- Single or multiple error display
- Material-UI Alert styling
- Automatic list formatting for multiple errors

## Integration

All error handling features are integrated into the main App component:

```tsx
// frontend/src/App.tsx
<ErrorBoundary>
  <ThemeProvider theme={theme}>
    <ToastProvider>
      <Router>
        <AuthProvider>
          {/* Routes */}
        </AuthProvider>
      </Router>
    </ToastProvider>
  </ThemeProvider>
</ErrorBoundary>
```

## Best Practices

1. **Always use the api utility** instead of raw axios for API calls to get automatic retry logic
2. **Use toast notifications** for user feedback instead of inline alerts
3. **Wrap critical sections** in error boundaries to prevent full app crashes
4. **Save session state** periodically for test sessions to enable recovery
5. **Show loading skeletons** instead of spinners for better UX
6. **Centralize validation errors** using ValidationError component

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 1.4:** Authentication error handling with user-friendly messages
- **Requirement 8.1:** Validation error display for forms
- **Requirement 8.5:** Progress feedback and error reporting for bulk operations

## Examples

### Example 1: API Call with Error Handling
```tsx
import { api, getErrorMessage } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

function DataFetcher() {
  const { showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/data', 
          { withCredentials: true },
          { maxRetries: 3 }
        );
        setData(response.data);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton variant="default" />;
  return <div>{/* render data */}</div>;
}
```

### Example 2: Form with Validation
```tsx
import { useToast } from '../contexts/ToastContext';
import ValidationError from './ValidationError';

function MyForm() {
  const { showSuccess, showError } = useToast();
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validate
    const validationErrors = [];
    if (!field1) validationErrors.push('Field 1 is required');
    if (!field2) validationErrors.push('Field 2 is required');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    try {
      await api.post('/api/submit', formData);
      showSuccess('Form submitted successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && <ValidationError errors={errors} />}
      {/* form fields */}
    </form>
  );
}
```
