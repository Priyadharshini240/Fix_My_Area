import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

export default function CityConnectApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [darkTheme, setDarkTheme] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [animatePage, setAnimatePage] = useState(true);
  const [events, setEvents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    place: "",
    img: "",
    description: "",
    published: true
  });
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    category: "",
    address: "",
    contact: "",
    description: "",
    img: "",
    published: true
  });
  const [newIssue, setNewIssue] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    urgency: "medium",
    status: "open"
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const audioRef = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    // Simple role logic
    if (username === "admin" && password === "admin123") {
      setRole("admin");
      setActivePage("admin");
      showNotification("Welcome Admin!", "success");
    } else if (username === "user" && password === "user123") {
      setRole("user");
      setActivePage("profile");
      showNotification("Welcome User!", "success");
    } else if (username === "business" && password === "business123") {
      setRole("business");
      setActivePage("business-dashboard");
      showNotification("Welcome Business Owner!", "success");
    } else {
      showNotification("Invalid credentials", "error");
      return;
    }
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setAnimatePage(false);
    setTimeout(() => {
      setLoggedIn(false);
      setRole(null);
      setActivePage("home");
      setAnimatePage(true);
      showNotification("Logged out successfully", "success");
    }, 500);
  };

  const changePage = (page) => {
    setAnimatePage(false);
    setTimeout(() => {
      setActivePage(page);
      setAnimatePage(true);
    }, 300);
  };

  const validateForm = (formData, fields) => {
    const errors = {};
    fields.forEach(field => {
      if (!formData[field]) errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    
    if (formType === "event") {
      setNewEvent({
        ...newEvent,
        [name]: value
      });
    } else if (formType === "business") {
      setNewBusiness({
        ...newBusiness,
        [name]: value
      });
    } else if (formType === "issue") {
      setNewIssue({
        ...newIssue,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const addEvent = () => {
    if (!validateForm(newEvent, ["title", "date", "place", "description"])) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    const eventToAdd = {
      ...newEvent,
      id: Date.now(),
      cta: "Get Tickets"
    };
    
    setEvents([eventToAdd, ...events]);
    
    // Reset form
    setNewEvent({
      title: "",
      date: "",
      place: "",
      img: "",
      description: "",
      published: true
    });
    
    showNotification("Event added successfully!", "success");
  };

  const addBusiness = () => {
    if (!validateForm(newBusiness, ["name", "category", "address", "description"])) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    const businessToAdd = {
      ...newBusiness,
      id: Date.now()
    };
    
    setBusinesses([businessToAdd, ...businesses]);
    
    // Reset form
    setNewBusiness({
      name: "",
      category: "",
      address: "",
      contact: "",
      description: "",
      img: "",
      published: true
    });
    
    showNotification("Business added successfully!", "success");
  };

  const reportIssue = () => {
    if (!validateForm(newIssue, ["title", "category", "description", "location"])) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    const issueToAdd = {
      ...newIssue,
      id: Date.now(),
      reportedBy: role === "user" ? "user123" : "guest",
      reportedDate: new Date().toLocaleDateString(),
      status: "open",
      comments: []
    };
    
    setIssues([issueToAdd, ...issues]);
    
    // Reset form
    setNewIssue({
      title: "",
      category: "",
      description: "",
      location: "",
      urgency: "medium",
      status: "open"
    });
    
    showNotification("Issue reported successfully!", "success");
  };

  const updateIssueStatus = (id, status) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { ...issue, status } : issue
    );
    setIssues(updatedIssues);
    showNotification(`Issue marked as ${status}`, "success");
  };

  const addCommentToIssue = (id, comment) => {
    const updatedIssues = issues.map(issue => 
      issue.id === id ? { 
        ...issue, 
        comments: [...(issue.comments || []), {
          text: comment,
          author: role === "admin" ? "Admin" : "User",
          date: new Date().toLocaleString()
        }] 
      } : issue
    );
    setIssues(updatedIssues);
    showNotification("Comment added", "success");
  };

  const toggleEventStatus = (id) => {
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, published: !event.published } : event
    );
    setEvents(updatedEvents);
    
    const event = events.find(e => e.id === id);
    showNotification(
      event.published ? "Event unpublished" : "Event published", 
      "success"
    );
  };

  const toggleBusinessStatus = (id) => {
    const updatedBusinesses = businesses.map(business => 
      business.id === id ? { ...business, published: !business.published } : business
    );
    setBusinesses(updatedBusinesses);
    
    const business = businesses.find(b => b.id === id);
    showNotification(
      business.published ? "Business unpublished" : "Business published", 
      "success"
    );
  };

  const deleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      showNotification("Event deleted successfully", "success");
    }
  };

  const deleteBusiness = (id) => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      const updatedBusinesses = businesses.filter(business => business.id !== id);
      setBusinesses(updatedBusinesses);
      showNotification("Business deleted successfully", "success");
    }
  };

  const deleteIssue = (id) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      const updatedIssues = issues.filter(issue => issue.id !== id);
      setIssues(updatedIssues);
      showNotification("Issue deleted successfully", "success");
    }
  };

  useEffect(() => {
    document.title = "City Connect - Dashboard";
    
    // Initialize with sample events
    setEvents([
      {
        id: 1,
        title: "Summer Music Festival",
        date: "August 25, 2025",
        place: "Race Course, Coimbatore",
        img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=60",
        description: "Join us for a day of music, food, and fun with local artists and performers.",
        cta: "Get Tickets",
        published: true
      },
      {
        id: 2,
        title: "Tech Innovation Summit",
        date: "September 12, 2025",
        place: "Codissia, Coimbatore",
        img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=60",
        description: "Explore the latest in technology and innovation with industry leaders.",
        cta: "Register Now",
        published: true
      }
    ]);
    
    // Initialize with sample businesses
    setBusinesses([
      {
        id: 1,
        name: "Coimbatore Central Mall",
        category: "Shopping",
        address: "123 Gandhipuram, Coimbatore",
        contact: "0422-1234567",
        description: "Largest shopping mall in Coimbatore with over 200 stores.",
        img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=60",
        published: true
      },
      {
        id: 2,
        name: "Annapoorna Restaurant",
        category: "Food",
        address: "456 RS Puram, Coimbatore",
        contact: "0422-2345678",
        description: "Famous South Indian restaurant serving authentic cuisine since 1960.",
        img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=60",
        published: true
      }
    ]);
    
    // Initialize with sample issues
    setIssues([
      {
        id: 1,
        title: "Pothole on Avinashi Road",
        category: "Road Maintenance",
        description: "Large pothole near Lakshmi Mills junction causing traffic issues",
        location: "Avinashi Road, Coimbatore",
        urgency: "high",
        status: "in-progress",
        reportedBy: "user123",
        reportedDate: "2025-08-15",
        comments: [
          {
            text: "Inspected the issue. Will schedule repairs soon.",
            author: "Admin",
            date: "2025-08-16"
          }
        ]
      },
      {
        id: 2,
        title: "Street Light Not Working",
        category: "Public Utilities",
        description: "Street light not working in Race Course area after 8 PM",
        location: "Race Course, Coimbatore",
        urgency: "medium",
        status: "open",
        reportedBy: "user456",
        reportedDate: "2025-08-18",
        comments: []
      }
    ]);
    
    // Handle music
    if (musicPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [musicPlaying]);

  const generateTicketPDF = (event) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("City Connect — Event Ticket", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Event: ${event.title}`, 20, 40);
    doc.text(`Date: ${event.date}`, 20, 50);
    doc.text(`Venue: ${event.place}`, 20, 60);

    doc.setDrawColor(0);
    doc.line(20, 70, 190, 70);

    doc.setFontSize(12);
    doc.text("Name: ___________________________", 20, 85);
    doc.text("Email: ___________________________", 20, 95);

    doc.setFontSize(10);
    doc.text("Generated by City Connect", 20, 115);
    doc.save(`${event.title.replace(/\s+/g, "_")}_Ticket.pdf`);
    showNotification("Ticket downloaded successfully!", "success");
  };

  // Filter businesses based on search and category
  const filteredBusinesses = businesses
    .filter(business => business.published)
    .filter(business => 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(business => 
      selectedCategory === "All" || business.category === selectedCategory
    );

  if (!loggedIn) {
    return (
      <div className="login-container">
        <style>{loginStyles}</style>
        <div className="login-card">
          <h2>Login to City Connect</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input type="text" name="username" placeholder="Username (try 'admin', 'user', or 'business')" required />
            <input type="password" name="password" placeholder="Password (try 'admin123', 'user123', or 'business123')" required />
            <button type="submit" className="login-btn">Login</button>
          </form>
          <div className="demo-credentials">
            <p>Admin: admin / admin123</p>
            <p>User: user / user123</p>
            <p>Business: business / business123</p>
          </div>
        </div>
        <audio ref={audioRef} loop>
          <source 
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
            type="audio/mpeg" 
          />
        </audio>
      </div>
    );
  }

  return (
    <div className={darkTheme ? "dark-theme" : ""}>
      <style>{globalStyles}</style>

      {/* Notification System */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="app-container">
        {/* Navbar */}
        <div className="navbar">
          <h2 className="logo">City Connect</h2>
          <div className="nav-links">
            {role === "user" && (
              <>
                <a href="#" onClick={() => changePage("profile")} className={activePage === "profile" ? "active" : ""}>
                  Profile
                </a>
                <a href="#" onClick={() => changePage("home")} className={activePage === "home" ? "active" : ""}>
                  Home
                </a>
                <a href="#" onClick={() => changePage("events")} className={activePage === "events" ? "active" : ""}>
                  Events
                </a>
                <a href="#" onClick={() => changePage("businesses")} className={activePage === "businesses" ? "active" : ""}>
                  Businesses
                </a>
                <a href="#" onClick={() => changePage("report-issue")} className={activePage === "report-issue" ? "active" : ""}>
                  Report Issue
                </a>
              </>
            )}
            {role === "admin" && (
              <>
                <a href="#" onClick={() => changePage("admin")} className={activePage === "admin" ? "active" : ""}>
                  Dashboard
                </a>
                <a href="#" onClick={() => changePage("events")} className={activePage === "events" ? "active" : ""}>
                  Events
                </a>
                <a href="#" onClick={() => changePage("businesses")} className={activePage === "businesses" ? "active" : ""}>
                  Businesses
                </a>
                <a href="#" onClick={() => changePage("event-manager")} className={activePage === "event-manager" ? "active" : ""}>
                  Manage Events
                </a>
                <a href="#" onClick={() => changePage("business-manager")} className={activePage === "business-manager" ? "active" : ""}>
                  Manage Businesses
                </a>
                <a href="#" onClick={() => changePage("issue-manager")} className={activePage === "issue-manager" ? "active" : ""}>
                  Manage Issues
                </a>
              </>
            )}
            {role === "business" && (
              <>
                <a href="#" onClick={() => changePage("business-dashboard")} className={activePage === "business-dashboard" ? "active" : ""}>
                  Dashboard
                </a>
                <a href="#" onClick={() => changePage("events")} className={activePage === "events" ? "active" : ""}>
                  Events
                </a>
                <a href="#" onClick={() => changePage("businesses")} className={activePage === "businesses" ? "active" : ""}>
                  Businesses
                </a>
                <a href="#" onClick={() => changePage("report-issue")} className={activePage === "report-issue" ? "active" : ""}>
                  Report Issue
                </a>
              </>
            )}
          </div>
          <div className="nav-controls">
            <button
              className="theme-toggle"
              onClick={() => setDarkTheme((d) => !d)}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {darkTheme ? "☀️" : "🌙"}
            </button>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              Logout
            </button>
          </div>
        </div>

        {/* Page rendering */}
        <div className={`main-content ${animatePage ? "page-enter" : "page-exit"}`}>
          {role === "user" && activePage === "profile" && (
            <div className="page-container">
              <h2>User Profile</h2>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">👤</div>
                  <h3>Welcome to City Connect!</h3>
                </div>
                <div className="profile-details">
                  <p><strong>Username:</strong> user123</p>
                  <p><strong>Email:</strong> user@cityconnect.com</p>
                  <p><strong>Member since:</strong> January 2024</p>
                  <p><strong>Issues Reported:</strong> {issues.filter(i => i.reportedBy === "user123").length}</p>
                </div>
              </div>
              <button onClick={() => changePage("home")} className="btn">
                Go to home
              </button>
            </div>
          )}

          {role === "admin" && activePage === "admin" && (
            <div className="page-container">
              <h2>Admin Dashboard</h2>
              <div className="dashboard-cards">
                <div className="stats-card">
                  <h3>{events.length}</h3>
                  <p>Total Events</p>
                </div>
                <div className="stats-card">
                  <h3>{events.filter(e => e.published).length}</h3>
                  <p>Published Events</p>
                </div>
                <div className="stats-card">
                  <h3>{businesses.length}</h3>
                  <p>Total Businesses</p>
                </div>
                <div className="stats-card">
                  <h3>{issues.length}</h3>
                  <p>Reported Issues</p>
                </div>
              </div>
              <p>Welcome, Admin! Manage events, businesses and issues from here.</p>
              <div className="quick-actions">
                <button className="btn" onClick={() => changePage("event-manager")}>
                  Manage Events
                </button>
                <button className="btn" onClick={() => changePage("business-manager")}>
                  Manage Businesses
                </button>
                <button className="btn" onClick={() => changePage("issue-manager")}>
                  Manage Issues
                </button>
              </div>
            </div>
          )}

          {role === "business" && activePage === "business-dashboard" && (
            <div className="page-container">
              <h2>Business Dashboard</h2>
              <div className="dashboard-cards">
                <div className="stats-card">
                  <h3>{events.length}</h3>
                  <p>Total Events</p>
                </div>
                <div className="stats-card">
                  <h3>{businesses.length}</h3>
                  <p>Total Businesses</p>
                </div>
                <div className="stats-card">
                  <h3>{issues.length}</h3>
                  <p>Reported Issues</p>
                </div>
              </div>
              <p>Welcome, Business Owner! Explore events and businesses in your city.</p>
              <div className="quick-actions">
                <button className="btn" onClick={() => changePage("events")}>
                  View Events
                </button>
                <button className="btn" onClick={() => changePage("businesses")}>
                  View Businesses
                </button>
                <button className="btn" onClick={() => changePage("report-issue")}>
                  Report Issue
                </button>
              </div>
            </div>
          )}

          {/* Home */}
          {activePage === "home" && (
            <div className="page-container" id="home">
              <div className="hero">
                <h1>Welcome to City Connect</h1>
                <p>Your City, Your Vibe</p>
                <div className="hero-buttons">
                  <a
                    href="#"
                    className="btn"
                    onClick={(e) => {
                      e.preventDefault();
                      changePage("events");
                    }}
                  >
                    Explore Events
                  </a>
                  <a
                    href="#"
                    className="btn secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      changePage("businesses");
                    }}
                  >
                    Find Businesses
                  </a>
                </div>
              </div>

              <h2 className="page-title">Quick Access</h2>
              <div className="quick-links">
                {[
                  { id: "events", icon: "🎉", title: "Local Events" },
                  { id: "businesses", icon: "🏪", title: "Businesses" },
                  { id: "report-issue", icon: "📝", title: "Report Issue" },
                  { id: "emergency", icon: "🚨", title: "Emergency Contacts" },
                ].map((q) => (
                  <div
                    key={q.id}
                    className="quick-card"
                    onClick={() => changePage(q.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && changePage(q.id)}
                  >
                    <div className="icon">{q.icon}</div>
                    <h3>{q.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {activePage === "events" && (
            <div className="page-container" id="events">
              <h2 className="page-title">Local Events</h2>
              {events.filter(event => event.published).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No Events Available</h3>
                  <p>Check back later for upcoming events in your city.</p>
                  {role === "admin" && (
                    <button className="btn" onClick={() => changePage("event-manager")}>
                      Create an Event
                    </button>
                  )}
                </div>
              ) : (
                <div className="events-container">
                  {events.filter(event => event.published).map((ev) => (
                    <div className="event-card" key={ev.id}>
                      <img src={ev.img} className="event-image" alt={ev.title} />
                      <div className="event-content">
                        <h3 className="event-title">{ev.title}</h3>
                        <p className="event-details">
                          {ev.date} | {ev.place}
                        </p>
                        <p>{ev.description}</p>
                        <button
                          className="btn"
                          style={{ marginTop: 15 }}
                          onClick={() => generateTicketPDF(ev)}
                        >
                          {ev.cta}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Businesses */}
          {activePage === "businesses" && (
            <div className="page-container" id="businesses">
              <h2 className="page-title">Local Businesses</h2>
              
              <div className="search-filters">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <select 
                    className="form-input"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Food">Food</option>
                    <option value="Services">Services</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>
              
              {filteredBusinesses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏪</div>
                  <h3>No Businesses Found</h3>
                  <p>Try adjusting your search or category filter.</p>
                  {role === "admin" && (
                    <button className="btn" onClick={() => changePage("business-manager")}>
                      Add a Business
                    </button>
                  )}
                </div>
              ) : (
                <div className="businesses-container">
                  {filteredBusinesses.map((business) => (
                    <div className="business-card" key={business.id}>
                      <img src={business.img} className="business-image" alt={business.name} />
                      <div className="business-content">
                        <h3 className="business-title">{business.name}</h3>
                        <p className="business-category">{business.category}</p>
                        <p className="business-address">{business.address}</p>
                        <p className="business-contact">{business.contact}</p>
                        <p className="business-description">{business.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report Issue */}
          {activePage === "report-issue" && (
            <div className="page-container" id="report-issue">
              <h2 className="page-title">Report an Issue</h2>
              
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">Issue Title *</label>
                  <input 
                    type="text" 
                    className={`form-input ${formErrors.title ? 'error' : ''}`}
                    placeholder="Brief title of the issue"
                    name="title"
                    value={newIssue.title}
                    onChange={(e) => handleInputChange(e, "issue")}
                  />
                  {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className={`form-input ${formErrors.category ? 'error' : ''}`}
                    name="category"
                    value={newIssue.category}
                    onChange={(e) => handleInputChange(e, "issue")}
                  >
                    <option value="">Select a category</option>
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Public Utilities">Public Utilities</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && <span className="error-text">{formErrors.category}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input 
                    type="text" 
                    className={`form-input ${formErrors.location ? 'error' : ''}`}
                    placeholder="Where is the issue located?"
                    name="location"
                    value={newIssue.location}
                    onChange={(e) => handleInputChange(e, "issue")}
                  />
                  {formErrors.location && <span className="error-text">{formErrors.location}</span>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Urgency</label>
                  <select 
                    className="form-input"
                    name="urgency"
                    value={newIssue.urgency}
                    onChange={(e) => handleInputChange(e, "issue")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea 
                    className={`form-input ${formErrors.description ? 'error' : ''}`}
                    placeholder="Please describe the issue in detail"
                    name="description"
                    value={newIssue.description}
                    onChange={(e) => handleInputChange(e, "issue")}
                    rows="5"
                  ></textarea>
                  {formErrors.description && <span className="error-text">{formErrors.description}</span>}
                </div>
                
                <button className="btn" onClick={reportIssue}>
                  Report Issue
                </button>
              </div>
              
              {(role === "user" || role === "business") && issues.filter(i => i.reportedBy === (role === "user" ? "user123" : "guest")).length > 0 && (
                <div className="reported-issues">
                  <h3>Your Reported Issues</h3>
                  {issues.filter(i => i.reportedBy === (role === "user" ? "user123" : "guest")).map(issue => (
                    <div key={issue.id} className="issue-card">
                      <div className="issue-header">
                        <h4>{issue.title}</h4>
                        <span className={`status-indicator ${issue.status}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="issue-meta">{issue.category} • {issue.location} • {issue.urgency} priority</p>
                      <p className="issue-description">{issue.description}</p>
                      <p className="issue-date">Reported on: {issue.reportedDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Manager (Admin only) */}
          {activePage === "event-manager" && role === "admin" && (
            <div className="page-container" id="event-manager">
              <h2 className="page-title">Manage Events</h2>
              
              <div className="admin-panel">
                <div className="event-form">
                  <h3>Create New Event</h3>
                  <div className="form-group">
                    <label className="form-label">Event Title *</label>
                    <input 
                      type="text" 
                      className={`form-input ${formErrors.title ? 'error' : ''}`}
                      placeholder="Event name"
                      name="title"
                      value={newEvent.title}
                      onChange={(e) => handleInputChange(e, "event")}
                    />
                    {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input 
                      type="date" 
                      className={`form-input ${formErrors.date ? 'error' : ''}`}
                      name="date"
                      value={newEvent.date}
                      onChange={(e) => handleInputChange(e, "event")}
                    />
                    {formErrors.date && <span className="error-text">{formErrors.date}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input 
                      type="text" 
                      className={`form-input ${formErrors.place ? 'error' : ''}`}
                      placeholder="Event location"
                      name="place"
                      value={newEvent.place}
                      onChange={(e) => handleInputChange(e, "event")}
                    />
                    {formErrors.place && <span className="error-text">{formErrors.place}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea 
                      className={`form-input ${formErrors.description ? 'error' : ''}`}
                      placeholder="Event description"
                      name="description"
                      value={newEvent.description}
                      onChange={(e) => handleInputChange(e, "event")}
                    ></textarea>
                    {formErrors.description && <span className="error-text">{formErrors.description}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Image link"
                      name="img"
                      value={newEvent.img}
                      onChange={(e) => handleInputChange(e, "event")}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="published"
                        checked={newEvent.published}
                        onChange={(e) => setNewEvent({...newEvent, published: e.target.checked})}
                      />
                      Publish immediately
                    </label>
                  </div>
                  <button className="btn publish-btn" onClick={addEvent}>
                    Add Event
                  </button>
                </div>
                
                <div className="events-list">
                  <h3>Existing Events ({events.length})</h3>
                  {events.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <p>No events created yet</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="manage-event-card">
                        <div className="event-header">
                          <h4>{event.title}</h4>
                          <span className={`status-indicator ${event.published ? 'published' : 'draft'}`}>
                            {event.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="event-meta">{event.date} | {event.place}</p>
                        <p className="event-description">{event.description.substring(0, 100)}...</p>
                        <div className="event-actions">
                          <button 
                            className={`toggle-status-btn ${event.published ? 'unpublish' : 'publish'}`}
                            onClick={() => toggleEventStatus(event.id)}
                          >
                            {event.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Business Manager (Admin only) */}
          {activePage === "business-manager" && role === "admin" && (
            <div className="page-container" id="business-manager">
              <h2 className="page-title">Manage Businesses</h2>
              
              <div className="admin-panel">
                <div className="event-form">
                  <h3>Add New Business</h3>
                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input 
                      type="text" 
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      placeholder="Business name"
                      name="name"
                      value={newBusiness.name}
                      onChange={(e) => handleInputChange(e, "business")}
                    />
                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select 
                      className={`form-input ${formErrors.category ? 'error' : ''}`}
                      name="category"
                      value={newBusiness.category}
                      onChange={(e) => handleInputChange(e, "business")}
                    >
                      <option value="">Select a category</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Food">Food</option>
                      <option value="Services">Services</option>
                      <option value="Entertainment">Entertainment</option>
                    </select>
                    {formErrors.category && <span className="error-text">{formErrors.category}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input 
                      type="text" 
                      className={`form-input ${formErrors.address ? 'error' : ''}`}
                      placeholder="Business address"
                      name="address"
                      value={newBusiness.address}
                      onChange={(e) => handleInputChange(e, "business")}
                    />
                    {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Information</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Phone number or email"
                      name="contact"
                      value={newBusiness.contact}
                      onChange={(e) => handleInputChange(e, "business")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea 
                      className={`form-input ${formErrors.description ? 'error' : ''}`}
                      placeholder="Business description"
                      name="description"
                      value={newBusiness.description}
                      onChange={(e) => handleInputChange(e, "business")}
                    ></textarea>
                    {formErrors.description && <span className="error-text">{formErrors.description}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Image link"
                      name="img"
                      value={newBusiness.img}
                      onChange={(e) => handleInputChange(e, "business")}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="published"
                        checked={newBusiness.published}
                        onChange={(e) => setNewBusiness({...newBusiness, published: e.target.checked})}
                      />
                      Publish immediately
                    </label>
                  </div>
                  <button className="btn publish-btn" onClick={addBusiness}>
                    Add Business
                  </button>
                </div>
                
                <div className="events-list">
                  <h3>Existing Businesses ({businesses.length})</h3>
                  {businesses.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏪</div>
                      <p>No businesses added yet</p>
                    </div>
                  ) : (
                    businesses.map((business) => (
                      <div key={business.id} className="manage-event-card">
                        <div className="event-header">
                          <h4>{business.name}</h4>
                          <span className={`status-indicator ${business.published ? 'published' : 'draft'}`}>
                            {business.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="event-meta">{business.category} | {business.address}</p>
                        <p className="event-description">{business.description.substring(0, 100)}...</p>
                        <div className="event-actions">
                          <button 
                            className={`toggle-status-btn ${business.published ? 'unpublish' : 'publish'}`}
                            onClick={() => toggleBusinessStatus(business.id)}
                          >
                            {business.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteBusiness(business.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Issue Manager (Admin only) */}
          {activePage === "issue-manager" && role === "admin" && (
            <div className="page-container" id="issue-manager">
              <h2 className="page-title">Manage Issues</h2>
              
              <div className="admin-panel">
                <div className="issues-list">
                  <h3>Reported Issues ({issues.length})</h3>
                  {issues.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <p>No issues reported yet</p>
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <div key={issue.id} className="manage-issue-card">
                        <div className="issue-header">
                          <h4>{issue.title}</h4>
                          <span className={`status-indicator ${issue.status}`}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="issue-meta">{issue.category} • {issue.location} • {issue.urgency} priority</p>
                        <p className="issue-description">{issue.description}</p>
                        <p className="issue-date">Reported by: {issue.reportedBy} on {issue.reportedDate}</p>
                        
                        {/* Comments section */}
                        {issue.comments && issue.comments.length > 0 && (
                          <div className="issue-comments">
                            <h5>Comments:</h5>
                            {issue.comments.map((comment, index) => (
                              <div key={index} className="comment">
                                <p><strong>{comment.author}</strong> ({comment.date}):</p>
                                <p>{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="issue-actions">
                          <select 
                            value={issue.status} 
                            onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          
                          <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            className="comment-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                addCommentToIssue(issue.id, e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                          />
                          
                          <button 
                            className="delete-btn"
                            onClick={() => deleteIssue(issue.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Emergency */}
          {activePage === "emergency" && (
            <div className="page-container" id="emergency">
              <h2 className="page-title">Emergency Contacts</h2>
              <div className="emergency-grid">
                {[
                  { icon: "🚓", title: "Police", lines: ["Emergency: 100", "Local Station: 0422-1234567"] },
                  { icon: "🚑", title: "Ambulance", lines: ["Emergency: 108", "General Hospital: 0422-2345678"] },
                  { icon: "🚒", title: "Fire Department", lines: ["Emergency: 101", "Fire Station: 0422-3456789"] },
                  { icon: "🆘", title: "Disaster Management", lines: ["Emergency: 1070", "Control Room: 0422-4567890"] },
                ].map((c) => (
                  <div className="emergency-card" key={c.title}>
                    <div className="emergency-icon">{c.icon}</div>
                    <h3>{c.title}</h3>
                    {c.lines.map((ln) => (
                      <p key={ln}>{ln}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>© 2025 City Connect Coimbatore. All rights reserved.</p>
        </div>

        {/* Music Toggle */}
        <div className="music-toggle">
          <button
            className={musicPlaying ? "playing" : ""}
            onClick={() => setMusicPlaying((p) => !p)}
            aria-label="Toggle music"
            title="Toggle music"
          >
            {musicPlaying ? "🔊" : "🔈"}
          </button>
        </div>
      </div>
      <audio ref={audioRef} loop>
        <source 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
          type="audio/mpeg" 
        />
      </audio>
    </div>
  );
}

const globalStyles = `
* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
  font-family: 'Poppins', sans-serif; 
}

:root { 
  --primary: #0077b6; 
  --secondary: #ff6f00; 
  --light: #f8f9fa; 
  --dark: #333; 
  --success: #28a745; 
  --danger: #dc3545; 
  --warning: #ffc107; 
  --info: #17a2b8; 
}

body { 
  background-color: #f0f2f5; 
  color: #333; 
  line-height: 1.6; 
  overflow-x: hidden; 
}

.app-container { 
  display: flex; 
  flex-direction: column; 
  min-height: 100vh; 
}

/* Notification System */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  animation: slideInRight 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.success {
  background: var(--success);
}

.notification.error {
  background: var(--danger);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.navbar { 
  background: linear-gradient(to right, #0077b6, #03045e); 
  color: white; 
  padding: 15px 30px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
  position: sticky; 
  top: 0; 
  z-index: 100; 
}

.logo {
  font-size: 1.8rem; 
  font-weight: 600;
  background: linear-gradient(45deg, #ff6f00, #ffbb00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.nav-links { 
  display: flex; 
  gap: 20px; 
}

.nav-links a { 
  color: white; 
  text-decoration: none; 
  padding: 8px 15px; 
  border-radius: 6px; 
  transition: all 0.3s ease; 
  font-weight: 500; 
  position: relative;
}

.nav-links a:hover, 
.nav-links a.active { 
  background: rgba(255,255,255,0.15); 
  transform: translateY(-2px);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--secondary);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  width: 80%;
}

.nav-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.theme-toggle { 
  background: transparent; 
  border: none; 
  color: white; 
  font-size: 1.2rem; 
  cursor: pointer; 
  padding: 8px; 
  border-radius: 50%; 
  transition: all 0.3s ease; 
}

.theme-toggle:hover { 
  background: rgba(255,255,255,0.15); 
  transform: rotate(180deg);
}

.logout-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.main-content { 
  flex: 1; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  position: relative;
  overflow: hidden;
}

.page-enter {
  animation: fadeIn 0.5s ease forwards;
}

.page-exit {
  animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from { 
    opacity: 1;
    transform: translateY(0);
  }
  to { 
    opacity: 0;
    transform: translateY(-20px);
  }
}

.page-container { 
  background: white; 
  border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
  padding: 20px; 
  overflow-y: auto; 
}

.page-title { 
  font-size: 1.8rem; 
  color: var(--primary); 
  margin: 20px 0; 
  padding-bottom: 10px; 
  border-bottom: 2px solid #eee; 
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--secondary);
  transition: width 0.5s ease;
}

.page-container:hover .page-title::after {
  width: 120px;
}

.hero { 
  text-align: center; 
  padding: 3rem 1rem; 
  background: linear-gradient(to bottom, #fff3e0, #ffe0b2); 
  border-radius: 12px; 
  margin-bottom: 30px; 
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
  transform: rotate(30deg);
  animation: shimmer 8s infinite linear;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
}

.hero h1 { 
  font-size: 2.5rem; 
  color: #ff6f00; 
  margin-bottom: 0.5rem; 
  animation: slideInDown 1s ease;
}

.hero p { 
  font-size: 1.2rem; 
  color: #555; 
  margin-bottom: 2rem; 
  animation: slideInUp 1s ease 0.2s both;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-buttons { 
  display: flex; 
  justify-content: center; 
  gap: 1rem; 
  flex-wrap: wrap; 
  animation: fadeIn 1s ease 0.4s both;
}

.btn { 
  background-color: #ff6f00; 
  color: white; 
  padding: 12px 24px; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 500; 
  transition: all 0.3s ease; 
  text-decoration: none; 
  display: inline-block; 
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover { 
  background-color: #e65100; 
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn.secondary {
  background-color: transparent;
  border: 2px solid #ff6f00;
  color: #ff6f00;
}

.btn.secondary:hover {
  background-color: #ff6f00;
  color: white;
}

.quick-links { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 20px; 
  margin-bottom: 30px; 
}

.quick-card { 
  background: #e0f7fa; 
  padding: 25px 20px; 
  border-radius: 12px; 
  text-align: center; 
  text-decoration: none; 
  color: #333; 
  transition: all 0.4s ease; 
  cursor: pointer; 
  position: relative;
  overflow: hidden;
}

.quick-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  transform: translateY(100%);
  transition: transform 0.4s ease;
}

.quick-card:hover::before {
  transform: translateY(0);
}

.quick-card:hover { 
  transform: translateY(-8px) scale(1.03); 
  box-shadow: 0 15px 30px rgba(0,0,0,0.15); 
  background-color: #b2ebf2; 
}

.icon { 
  font-size: 2.5rem; 
  margin-bottom: 10px; 
  display: inline-block;
  transition: transform 0.3s ease;
}

.quick-card:hover .icon {
  transform: scale(1.2) rotate(5deg);
}

.events-container { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 20px; 
}

.event-card { 
  background: white; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
  transition: all 0.4s ease; 
  position: relative;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.event-card:hover::before {
  opacity: 1;
}

.event-card:hover { 
  transform: translateY(-8px) scale(1.02); 
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.event-image { 
  width: 100%; 
  height: 180px; 
  object-fit: cover; 
  transition: transform 0.5s ease;
}

.event-card:hover .event-image {
  transform: scale(1.1);
}

.event-content { 
  padding: 20px; 
  position: relative;
}

.event-title { 
  font-size: 1.2rem; 
  color: var(--primary); 
  margin-bottom: 10px; 
}

.event-details { 
  color: #666; 
  font-size: 0.9rem; 
  margin-bottom: 15px; 
}

/* Business Cards */
.businesses-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.business-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.4s ease;
}

.business-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.business-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.business-content {
  padding: 20px;
}

.business-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 5px;
}

.business-category {
  color: #ff6f00;
  font-weight: 500;
  margin-bottom: 10px;
}

.business-address, .business-contact {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.business-description {
  color: #777;
  margin-top: 10px;
}

/* Search and Filters */
.search-filters {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

/* Issue Cards */
.issue-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid var(--info);
}

.issue-card.high {
  border-left-color: var(--danger);
}

.issue-card.medium {
  border-left-color: var(--warning);
}

.issue-card.low {
  border-left-color: var(--success);
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.issue-meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.issue-date {
  color: #777;
  font-size: 0.8rem;
  margin-top: 10px;
}

/* Form Styles */
.form-container { 
  max-width: 600px; 
  margin: 0 auto; 
  background: white; 
  padding: 25px; 
  border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
  animation: zoomIn 0.5s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.form-group { 
  margin-bottom: 20px; 
  position: relative;
}

.form-label { 
  display: block; 
  margin-bottom: 8px; 
  font-weight: 500; 
  color: #444; 
}

.form-input { 
  width: 100%; 
  padding: 12px 15px; 
  border: 1px solid #ddd; 
  border-radius: 8px; 
  font-size: 1rem; 
  transition: all 0.3s ease; 
}

.form-input:focus { 
  border-color: var(--primary); 
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,119,182,0.1);
  transform: translateY(-2px);
}

.form-input.error {
  border-color: var(--danger);
}

.error-text {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

textarea.form-input { 
  min-height: 120px; 
  resize: vertical; 
}

.emergency-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 20px; 
}

.emergency-card { 
  background: white; 
  border-radius: 12px; 
  padding: 20px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
  text-align: center; 
  transition: all 0.4s ease; 
  position: relative;
  overflow: hidden;
}

.emergency-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: var(--danger);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.emergency-card:hover::before {
  transform: scaleX(1);
}

.emergency-card:hover { 
  transform: translateY(-8px); 
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.emergency-icon { 
  font-size: 2.5rem; 
  margin-bottom: 15px; 
  color: var(--danger); 
  display: inline-block;
  transition: transform 0.3s ease;
}

.emergency-card:hover .emergency-icon {
  transform: scale(1.2);
}

.footer { 
  background: linear-gradient(to right, #0077b6, #03045e); 
  color: white; 
  text-align: center; 
  padding: 20px; 
  margin-top: 30px; 
}

.music-toggle { 
  position: fixed; 
  bottom: 20px; 
  right: 20px; 
  z-index: 100; 
}

.music-toggle button { 
  font-size: 1.5rem; 
  background: var(--primary); 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 60px; 
  height: 60px; 
  cursor: pointer; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
  transition: all 0.3s ease; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.music-toggle button:hover {
  transform: scale(1.1);
}

.music-toggle button.playing { 
  animation: pulse 1s infinite; 
}

@keyframes pulse { 
  0%{ transform: scale(1);} 
  50%{ transform: scale(1.1);} 
  100%{ transform: scale(1);} 
}

/* Admin Panel Styles */
.admin-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.event-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.events-list, .issues-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  max-height: 600px;
  overflow-y: auto;
}

.manage-event-card, .manage-issue-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.manage-event-card:hover, .manage-issue-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.event-header, .issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.event-meta, .issue-meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.event-description, .issue-description {
  color: #777;
  margin-bottom: 15px;
}

.status-indicator {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-indicator.published {
  background: #d4edda;
  color: #155724;
}

.status-indicator.draft {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.open {
  background: #d1ecf1;
  color: #0c5460;
}

.status-indicator['in-progress'] {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.resolved {
  background: #d4edda;
  color: #155724;
}

.event-actions, .issue-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.toggle-status-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.toggle-status-btn.publish {
  background: #28a745;
  color: white;
}

.toggle-status-btn.unpublish {
  background: #6c757d;
  color: white;
}

.delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  background: #dc3545;
  color: white;
  transition: all 0.3s ease;
}

.toggle-status-btn:hover,
.delete-btn:hover {
  transform: scale(1.05);
}

.status-select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.comment-input {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
}

.issue-comments {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.comment {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.comment p {
  margin: 5px 0;
}

/* Dashboard Styles */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.stats-card h3 {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 10px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

/* Profile Styles */
.profile-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.profile-avatar {
  font-size: 3rem;
}

.profile-details p {
  margin-bottom: 10px;
}

/* Empty State Styles */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.reported-issues {
  margin-top: 30px;
}

@media (max-width: 768px) { 
  .navbar { 
    flex-direction: column; 
    gap: 15px; 
    padding: 15px; 
  } 
  .nav-links { 
    flex-wrap: wrap; 
    justify-content: center; 
  } 
  .hero h1 { 
    font-size: 2rem; 
  } 
  .quick-links { 
    grid-template-columns: 1fr; 
  }
  .admin-panel {
    grid-template-columns: 1fr;
  }
  .event-actions, .issue-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .quick-actions {
    flex-direction: column;
  }
  .search-filters {
    grid-template-columns: 1fr;
  }
}

/* Dark theme quick swap */
.dark-theme body, 
.dark-theme .page-container,
.dark-theme .form-container { 
  background: #111; 
  color: #eee; 
}

.dark-theme .page-title { 
  border-color: #333; 
}

.dark-theme .quick-card { 
  background: #0e2a35; 
  color: #e0f7fa; 
}

.dark-theme .quick-card:hover { 
  background: #114052; 
}

.dark-theme .form-input { 
  background: #0b0b0b; 
  color: #eee; 
  border-color: #333; 
}

.dark-theme .event-card,
.dark-theme .emergency-card,
.dark-theme .business-card {
  background: #1a1a1a;
}

.dark-theme .hero {
  background: linear-gradient(to bottom, #2c2c2c, #1a1a1a);
}

.dark-theme .hero h1 {
  color: #ff8f00;
}

.dark-theme .hero p {
  color: #bbb;
}

.dark-theme .event-form,
.dark-theme .events-list,
.dark-theme .profile-card,
.dark-theme .stats-card,
.dark-theme .issue-card,
.dark-theme .manage-event-card,
.dark-theme .manage-issue-card {
  background: #1a1a1a;
}

.dark-theme .comment {
  background: #2a2a2a;
}
`;

const loginStyles = `
.login-container { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  min-height: 100vh; 
  background: linear-gradient(135deg, #0077b6, #03045e); 
  color: white;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 15s infinite linear;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 400px;
  z-index: 1;
  animation: slideUp 0.8s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  background: linear-gradient(45deg, #ff6f00, #ffbb00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

.login-form input { 
  padding: 12px 15px; 
  border-radius: 8px; 
  border: none; 
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.login-form input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.3);
  transform: translateY(-2px);
}

.login-btn { 
  padding: 12px; 
  border-radius: 8px; 
  border: none; 
  background: linear-gradient(45deg, #ff6f00, #ff8f00);
  color: white; 
  font-weight: bold; 
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.demo-credentials {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 0.9rem;
}

.demo-credentials p {
  margin: 5px 0;
}
`;