import { useState, useRef, useEffect } from "react";
import { generateBusinessPlan } from "../services/aiService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveBusinessPlan, getBusinessPlans } from "../services/planService"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ================= AUTH INTEGRATION LAYERS =================
import { auth } from "../firebase/firebaseConfig"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]); 
  const [user, setUser] = useState(null);

  // ================= THEME & CONFIGURATION STATE =================
  const [settings, setSettings] = useState({
    themePreference: "Light", 
    defaultExportFormat: "PDF Asset",
    autoSaveDrafts: true,
  });

  const [subscription, setSubscription] = useState({
    tier: "Pro Studio Workspace",
    renewalDate: "July 24, 2026",
    status: "Active",
    price: "$19/month"
  });

  const reportRef = useRef(null);

  // Derive active style colors dynamically based on settings.themePreference
  const isDark = settings.themePreference === "Dark";
  const colors = {
    bg: isDark ? "#0f172a" : "#ffffff",
    surface: isDark ? "#1e293b" : "#ffffff",
    surfaceAlt: isDark ? "#334155" : "#f8fafc",
    text: isDark ? "#f8fafc" : "#0f172a",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#e2e8f0",
    borderLight: isDark ? "#1e293b" : "#f1f5f9",
    inputBg: isDark ? "#1e293b" : "#ffffff",
    navBg: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)"
  };

  // ================= LISTEN FOR REAL USER SESSION =================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const nameParts = currentUser.displayName ? currentUser.displayName.split(" ") : [];
        const computedInitials = nameParts.length >= 2 
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : nameParts.length === 1 ? nameParts[0][0].toUpperCase() : "U";

        setUser({
          name: currentUser.displayName || "Active Workspace User",
          email: currentUser.email || "Authenticated Account",
          initials: computedInitials
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ================= LOAD RECENT LOGS =================
  const fetchRecentPlans = async () => {
    try {
      const data = await getBusinessPlans();
      setSavedPlans(data || []);
    } catch (error) {
      console.error("Error loading index ledger:", error);
    }
  };

  useEffect(() => {
    fetchRecentPlans();
  }, []);

  // ================= GENERATE =================
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const result = await generateBusinessPlan(prompt);
      setPlan(result.plan);
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!plan) return;

    try {
      setSaving(true);
      await saveBusinessPlan(prompt, plan);
      alert("Plan saved successfully!");
      fetchRecentPlans();
    } catch (error) {
      console.error(error);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  // ================= REGEX PARSING ENGINE =================
  const extractValueByKey = (targetKey, fallback = "N/A") => {
    if (!plan) return fallback;
    const normalizedText = plan.replace(/\*/g, "");
    const regex = new RegExp(`${targetKey}\\s*:\\s*([^\\n]+)`, "i");
    const match = normalizedText.match(regex);
    return match && match[1] ? match[1].trim() : fallback;
  };

  const metaData = {
    name: extractValueByKey("Business Name", "Strategic Business Plan"),
    industry: extractValueByKey("Industry", "Target Sector"),
    location: extractValueByKey("Location", "Target Market"),
    date: extractValueByKey("Generated Date", "2026")
  };

  const kpiData = {
    cost: extractValueByKey("Startup Cost", "Calculated in Plan"),
    revenue: extractValueByKey("Monthly Revenue", "Calculated in Plan"),
    expenses: extractValueByKey("Monthly Expenses", "Calculated in Plan"),
    profit: extractValueByKey("Expected Profit", "Calculated in Plan")
  };

  const cleanPlanMarkdown = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .filter(line => {
        const cleanLine = line.replace(/\*/g, "").trim().toLowerCase();
        return !cleanLine.startsWith("metadata:") && !cleanLine.startsWith("kpi:");
      })
      .join("\n");
  };

  // ================= HIGH-SHARPNESS PDF GENERATOR =================
  const downloadPDF = async () => {
    if (!plan || !reportRef.current) return;

    try {
      const element = reportRef.current;
      
      // Optimized canvas rendering settings
      const canvas = await html2canvas(element, {
        scale: 2, // Balanced down from 4 to dramatically decrease memory and speed up processing
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? "#1e293b" : "#ffffff", 
        imageTimeout: 0,
        removeContainer: true, // Speeds up lifecycle cleanup inside html2canvas
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(element.id) || clonedDoc.querySelector('[ref]');
          if (clonedElement) {
            clonedElement.style.WebkitFontSmoothing = "antialiased";
            clonedElement.style.MozOsxFontSmoothing = "grayscale";
          }
        }
      });

      // Switched to JPEG format (lighter processing footprint than raw PNG compression arrays)
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" }); // Dropped standard compress block flag
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const fileSlug = String(metaData.name).toLowerCase().replace(/\s+/g, "-");
      pdf.save(`${fileSlug}-plan.pdf`);
    } catch (pdfError) {
      console.error(pdfError);
      alert("Failed to export clean visual asset.");
    }
  };

  const loadPlanIntoWorkspace = (selectedPlan) => {
    setPrompt(selectedPlan.prompt || "");
    setPlan(selectedPlan.plan || "");
    setMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to cleanly disconnect session tokens:", error);
      window.location.href = "/";
    }
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  return (
    <div style={{ ...styles.page, background: colors.bg, color: colors.text }}>
      {/* NAVBAR */}
      <header style={{ ...styles.navbar, background: colors.navBg, borderBottom: `1px solid ${colors.borderLight}` }}>
        <div style={styles.navContainer}>
          <div style={styles.brand}>
            <button onClick={() => setMenuOpen(true)} style={{ ...styles.hamburger, color: colors.text }}>
              ☰
            </button>
            <div style={{ ...styles.logoDot, background: colors.text }} />
            <span style={styles.logoText}>PlanForge</span>
          </div>
          <nav style={styles.navLinks}>
            <span style={{ ...styles.navItem, color: colors.textMuted }}>Studio Workspace</span>
            <button style={styles.logoutLinkBtn} onClick={() => setShowLogoutModal(true)}>Sign Out</button>
          </nav>
        </div>
      </header>

      {/* DRAWER HISTORICAL SYSTEM */}
      {menuOpen && <div style={styles.drawerOverlay} onClick={() => setMenuOpen(false)} />}
      <nav style={{ ...styles.drawer, background: colors.surface, borderRight: `1px solid ${colors.border}`, transform: menuOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div style={styles.drawerHeader}>
          <h3 style={styles.drawerTitle}>Saved Strategies</h3>
          <button style={styles.closeDrawer} onClick={() => setMenuOpen(false)}>×</button>
        </div>
        
        <div style={styles.drawerMenu}>
          <button style={{...styles.menuBtn, background: isDark ? "#ffffff" : "#0f172a", color: isDark ? "#0f172a" : "#ffffff", border: `1px solid ${colors.text}`}} onClick={() => { setPlan(""); setPrompt(""); setMenuOpen(false); }}>
            + Start New Generation
          </button>
          
          <hr style={{ ...styles.drawerDivider, borderBottom: `1px solid ${colors.borderLight}` }} />
          <span style={styles.sectionHeading}>ARCHIVE HISTORY ({savedPlans.length})</span>
          
          <div style={styles.historyContainer}>
            {savedPlans.length === 0 ? (
              <p style={styles.emptyStateText}>No models stored in Firestore yet.</p>
            ) : (
              savedPlans.map((item, index) => {
                const planTitle = item.prompt ? (item.prompt.length > 28 ? item.prompt.substring(0, 25) + "..." : item.prompt) : `Saved Draft #${index + 1}`;
                return (
                  <button 
                    key={item.id || index} 
                    onClick={() => loadPlanIntoWorkspace(item)} 
                    style={{ ...styles.historyRowBtn, background: colors.surfaceAlt, border: `1px solid ${colors.borderLight}` }}
                  >
                    <span style={styles.docIcon}>📄</span>
                    <span style={{ ...styles.historyBtnTitle, color: colors.text }}>{planTitle}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PROFILE FOOTER SECTION */}
        {user && (
          <div style={{ ...styles.drawerFooterProfile, borderTop: `1px solid ${colors.borderLight}` }}>
            <div style={styles.profileMetaZone}>
              <div style={{ ...styles.avatarCircle, background: colors.surfaceAlt, border: `1px solid ${colors.border}`, color: colors.text }}>
                {user.initials}
              </div>
              <div style={styles.identityTextStack}>
                <span style={{ ...styles.profileUserName, color: colors.text }}>{user.name}</span>
                <span style={styles.profileUserEmail}>{user.email}</span>
              </div>
            </div>
            <button 
              style={{ ...styles.settingsIconButton, color: colors.textMuted }} 
              onClick={handleOpenSettings}
              title="Workspace Settings"
            >
              ⚙️
            </button>
          </div>
        )}
      </nav>

      {/* CORE INPUT GENERATOR FRAME */}
      <section style={{ ...styles.heroSection, background: isDark ? "transparent" : "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
        <div style={styles.sectionContainer}>
          <div style={styles.heroTextCenter}>
            <span style={{ ...styles.pillBadge, background: colors.surfaceAlt, color: colors.textMuted }}>AI GENERATION ENGINE</span>
            <h1 style={{ ...styles.mainHeading, color: "#2563eb" }}>Forge Your Business Strategy</h1>
            <p style={{ ...styles.subHeadingText, color: colors.textMuted }}>
              Input your raw market concepts below to architect automated financials, structured metrics, and complete markdown briefs instantly.
            </p>
          </div>

          <div style={{ ...styles.inputCard, background: colors.surface, border: `1px solid ${colors.border}` }}>
            <label style={{ ...styles.inputLabel, color: colors.text }}>Describe your business model & target market</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ ...styles.textarea, background: colors.inputBg, color: colors.text, border: `1px solid ${colors.border}` }}
              placeholder="e.g., A specialty coffee roastery in Austin, Texas targeting eco-conscious millennials..."
            />

            <div style={styles.controlsRow}>
              <button onClick={handleGenerate} disabled={loading} style={{ ...styles.primaryButton, background: colors.text, color: colors.bg }}>
                {loading ? "Processing Architecture..." : "Generate Business Plan"}
              </button>

              {plan && (
                <div style={styles.actionGroup}>
                  <button onClick={handleSave} disabled={saving} style={{ ...styles.secondaryButton, color: colors.text, border: `1px solid ${colors.border}`, background: colors.surface }}>
                    {saving ? "Saving..." : "Save Strategy"}
                  </button>
                  <button onClick={downloadPDF} style={styles.accentButton}>Download PDF Asset</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RENDER CANVAS SHEET */}
      {plan && (
        <section style={styles.previewSection}>
          <div style={styles.sectionContainer}>
            <div style={{ ...styles.previewHeaderRow, borderBottom: `2px solid ${colors.borderLight}` }}>
              <div>
                <h2 style={{ ...styles.sectionTitle, color: colors.text }}>Document Workspace</h2>
                <p style={styles.sectionSubtitle}>Interactive dynamic canvas rendering live data layers</p>
              </div>
              <button style={styles.clearBtn} onClick={() => { setPlan(""); setPrompt(""); }}>Reset Canvas</button>
            </div>

            <div ref={reportRef} style={{ ...styles.a4PageSheet, background: colors.surface, border: `1px solid ${colors.border}` }}>
              <div style={{ ...styles.docCover, background: colors.surfaceAlt, borderLeft: `4px solid ${colors.text}` }}>
                <span style={styles.docBadge}>CONFIDENTIAL STRATEGIC PLAN</span>
                <h1 style={{ ...styles.docTitle, color: colors.text }}>{metaData.name}</h1>
                <div style={{ ...styles.docMeta, color: colors.textMuted }}>
                  <span><strong>Industry:</strong> {metaData.industry}</span>
                  <span><strong>Location:</strong> {metaData.location}</span>
                  <span><strong>Date:</strong> {metaData.date}</span>
                </div>
              </div>

              {/* KPI DISPLAYS */}
              <div style={styles.metricGrid}>
                {[
                  { label: "STARTUP COST", value: kpiData.cost },
                  { label: "MONTHLY REVENUE", value: kpiData.revenue, color: "#10b981" },
                  { label: "MONTHLY EXPENSES", value: kpiData.expenses, color: "#ef4444" },
                  { label: "EXPECTED PROFIT", value: kpiData.profit }
                ].map((kpi, idx) => (
                  <div key={idx} style={{ ...styles.metricCard, background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <span style={styles.metricLabel}>{kpi.label}</span>
                    <span style={{ ...styles.metricValue, color: kpi.color || colors.text }}>{kpi.value}</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: 0, borderBottom: `1px solid ${colors.border}`, margin: "30px 0" }} />

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: "20px", fontWeight: "700", marginTop: "32px", marginBottom: "14px", color: colors.text, borderBottom: `1px solid ${colors.border}`, paddingBottom: "6px" }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: "15px", fontWeight: "600", marginTop: "22px", marginBottom: "8px", color: colors.text }}>{children}</h2>,
                  p: ({ children }) => <p style={{ lineHeight: "1.7", fontSize: "14px", color: colors.textMuted, marginBottom: "12px" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: "600", color: colors.text }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ paddingLeft: "20px", marginBottom: "12px", color: colors.textMuted, fontSize: "14px", lineHeight: "1.7" }}>{children}</ul>,
                  table: ({ children }) => <div style={{ overflowX: "auto", margin: "20px 0", borderRadius: "6px", border: `1px solid ${colors.border}` }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>{children}</table></div>,
                  th: ({ children }) => <th style={{ background: colors.surfaceAlt, color: colors.text, padding: "10px 12px", fontWeight: "600", fontSize: "12.5px", borderBottom: `2px solid ${colors.border}` }}>{children}</th>,
                  td: ({ children }) => <td style={{ padding: "10px 12px", borderBottom: `1px solid ${colors.borderLight}`, color: colors.textMuted, fontSize: "12.5px" }}>{children}</td>,
                }}
              >
                {cleanPlanMarkdown(plan)}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* ================= WORKSPACE CONFIGURATION POPOVER DIALOGUE ================= */}
      {showSettingsModal && (
        <div style={styles.modalOverlayClean} onClick={() => setShowSettingsModal(false)}>
          <div style={{ ...styles.settingsPopoverBox, background: colors.surface, border: `1px solid ${colors.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.settingsHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>⚙️</span>
                <h3 style={{ ...styles.settingsTitle, color: colors.text }}>Workspace Settings</h3>
              </div>
              <button style={styles.closeSettingsBtn} onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <p style={styles.settingsSubtitleText}>Configure dynamic styling and plan configurations.</p>
            
            <hr style={{ ...styles.drawerDivider, borderBottom: `1px solid ${colors.borderLight}` }} />

            <div style={styles.settingsForm}>
              <div style={styles.settingsFormGroup}>
                <label style={{ ...styles.settingsLabel, color: colors.text }}>Visual Interface Mode</label>
                <select 
                  value={settings.themePreference} 
                  onChange={(e) => setSettings({...settings, themePreference: e.target.value})}
                  style={{ ...styles.settingsSelect, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <option value="Light">Light Mode (Default)</option>
                  <option value="Dark">Dark Mode</option>
                </select>
              </div>

              {/* DYNAMIC COMPACT SUBSCRIPTION WIDGET */}
              <div style={{ ...styles.subscriptionCardContainer, background: colors.surfaceAlt, border: `1px solid ${colors.border}` }}>
                <div style={styles.subscriptionCardHeader}>
                  <span style={styles.subscriptionBadgeIcon}>💎</span>
                  <div>
                    <h4 style={{ ...styles.subscriptionTitle, color: colors.text }}>Active Tier License</h4>
                    <span style={styles.subscriptionSubtext}>Account tier access log</span>
                  </div>
                </div>
                <div style={styles.subscriptionDataRowGrid}>
                  <div>
                    <span style={styles.subGridLabel}>PLAN TYPE</span>
                    <span style={{ ...styles.subGridValue, color: colors.text }}>{subscription.tier}</span>
                  </div>
                  <div>
                    <span style={styles.subGridLabel}>BILLING RATE</span>
                    <span style={{ ...styles.subGridValue, color: "#10b981" }}>{subscription.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.settingsFooterActions}>
              <button style={{ ...styles.primaryButton, background: colors.text, color: colors.bg, width: "100%", padding: "10px" }} onClick={() => setShowSettingsModal(false)}>
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCONNECT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, background: colors.surface, border: `1px solid ${colors.border}` }}>
            <h3 style={{ ...styles.modalTitle, color: colors.text }}>Sign Out</h3>
            <p style={{ ...styles.modalText, color: colors.textMuted }}>Are you sure you want to exit your Workspace? Any unsaved changes will be lost.</p>
            <div style={styles.modalActions}>
              <button style={styles.modalCancelBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button style={styles.modalConfirmBtn} onClick={handleLogoutConfirm}>Confirm Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

// Styles remain unchanged below...
const styles = {
  page: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", minHeight: "100vh", transition: "background 0.2s ease, color 0.2s ease" },
  navbar: { height: "70px", position: "sticky", top: 0, zIndex: 80, display: "flex", alignItems: "center", backdropFilter: "blur(12px)" },
  navContainer: { width: "100%", maxWidth: "1140px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: "14px" },
  hamburger: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", padding: "4px" },
  logoDot: { width: "10px", height: "10px", borderRadius: "50%" },
  logoText: { fontSize: "17px", fontWeight: "700", letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "24px" },
  navItem: { fontSize: "14px", fontWeight: "500" },
  logoutLinkBtn: { background: "none", border: "none", fontSize: "14px", fontWeight: "600", color: "#ef4444", cursor: "pointer" },

  drawerOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.2)", backdropFilter: "blur(2px)", zIndex: 90 },
  drawer: { position: "fixed", top: 0, left: 0, width: "300px", height: "100%", padding: "28px 24px", transition: "transform 0.25s ease", zIndex: 100, display: "flex", flexDirection: "column", boxSizing: "border-box" },
  drawerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  drawerTitle: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", margin: 0, textTransform: "uppercase" },
  closeDrawer: { background: "none", border: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" },
  drawerMenu: { display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" },
  menuBtn: { width: "100%", padding: "12px 14px", borderRadius: "6px", textAlign: "left", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  drawerDivider: { border: 0, margin: "14px 0" },
  sectionHeading: { fontSize: "10px", fontWeight: "700", color: "#94a3b8", marginBottom: "12px", display: "block" },
  historyContainer: { display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flexGrow: 1, marginBottom: "16px" },
  emptyStateText: { fontSize: "12px", color: "#94a3b8" },
  historyRowBtn: { width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 12px", borderRadius: "6px", cursor: "pointer", textAlign: "left" },
  docIcon: { fontSize: "13px" },
  historyBtnTitle: { fontSize: "13px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  drawerFooterProfile: { paddingTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  profileMetaZone: { display: "flex", alignItems: "center", gap: "12px" },
  avatarCircle: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600" },
  identityTextStack: { display: "flex", flexDirection: "column", gap: "2px" },
  profileUserName: { fontSize: "13.5px", fontWeight: "600" },
  profileUserEmail: { fontSize: "11px", color: "#64748b" },
  settingsIconButton: { background: "none", border: "none", fontSize: "18px", cursor: "pointer" },

  sectionContainer: { maxWidth: "860px", margin: "0 auto", padding: "0 24px" },
  heroSection: { padding: "80px 0 50px 0" },
  heroTextCenter: { textAlign: "center", marginBottom: "40px" },
  pillBadge: { display: "inline-block", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", marginBottom: "16px" },
  mainHeading: { fontSize: "36px", fontWeight: "800", margin: "0 0 16px 0", letterSpacing: "-0.03em" },
  subHeadingText: { fontSize: "16px", lineHeight: "1.6", margin: "0 auto", maxWidth: "580px" },
  
  inputCard: { padding: "32px", borderRadius: "12px", boxShadow: "0 10px 30px -10px rgba(15,23,42,0.03)" },
  inputLabel: { display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "12px" },
  textarea: { width: "100%", padding: "16px", borderRadius: "8px", fontSize: "14.5px", lineHeight: "1.5", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" },
  controlsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "12px", flexWrap: "wrap" },
  actionGroup: { display: "flex", gap: "10px" },
  
  primaryButton: { padding: "12px 24px", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13.5px", cursor: "pointer" },
  secondaryButton: { padding: "12px 20px", borderRadius: "6px", fontWeight: "500", fontSize: "13.5px", cursor: "pointer" },
  accentButton: { background: "#10b981", color: "#ffffff", padding: "12px 20px", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13.5px", cursor: "pointer" },

  previewSection: { padding: "30px 0 90px 0" },
  previewHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", paddingBottom: "16px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", margin: 0 },
  sectionSubtitle: { fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" },
  clearBtn: { background: "none", border: "none", color: "#ef4444", fontSize: "13px", cursor: "pointer", fontWeight: "600" },

  a4PageSheet: { width: "100%", minHeight: "1100px", padding: "50px 60px", boxSizing: "border-box", borderRadius: "12px", boxShadow: "0 20px 40px -20px rgba(15,23,42,0.05)" },
  docCover: { padding: "24px", borderRadius: "0 8px 8px 0", marginBottom: "32px" },
  docBadge: { fontSize: "9px", fontWeight: "700", color: "#64748b", letterSpacing: "0.1em" },
  docTitle: { fontSize: "26px", fontWeight: "800", margin: "8px 0 16px 0", letterSpacing: "-0.02em" },
  docMeta: { display: "flex", gap: "28px", fontSize: "13px" },
  
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", margin: "24px 0" },
  metricCard: { padding: "14px", borderRadius: "8px", display: "flex", flexDirection: "column" },
  metricLabel: { fontSize: "9px", fontWeight: "700", color: "#94a3b8" },
  metricValue: { fontSize: "14px", fontWeight: "700", marginTop: "6px" },

  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modalBox: { padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 50px rgba(15,23,42,0.1)", boxSizing: "border-box" },
  modalTitle: { margin: "0 0 12px 0", fontSize: "18px", fontWeight: "700" },
  modalText: { margin: "0 0 24px 0", fontSize: "14px", lineHeight: "1.5" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "12px" },
  modalCancelBtn: { background: "#f1f5f9", border: "none", color: "#475569", padding: "10px 18px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  modalConfirmBtn: { background: "#ef4444", border: "none", color: "#ffffff", padding: "10px 18px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },

  modalOverlayClean: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent", zIndex: 120 },
  settingsPopoverBox: { position: "fixed", left: "16px", bottom: "86px", padding: "24px", borderRadius: "12px", width: "320px", boxShadow: "0 10px 40px -10px rgba(15,23,42,0.2)", boxSizing: "border-box" },
  settingsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
  settingsTitle: { margin: 0, fontSize: "15px", fontWeight: "700" },
  closeSettingsBtn: { background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", padding: 0 },
  settingsSubtitleText: { margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.4" },
  settingsForm: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px", marginBottom: "18px" },
  settingsFormGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  settingsLabel: { fontSize: "11.5px", fontWeight: "600" },
  settingsSelect: { width: "100%", padding: "8px 10px", borderRadius: "6px", fontSize: "13px", outline: "none" },
  settingsFooterActions: { display: "flex" },

  subscriptionCardContainer: { padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "12px" },
  subscriptionCardHeader: { display: "flex", alignItems: "center", gap: "10px" },
  subscriptionBadgeIcon: { fontSize: "18px" },
  subscriptionTitle: { margin: 0, fontSize: "12.5px", fontWeight: "700" },
  subscriptionSubtext: { fontSize: "10px", color: "#64748b", display: "block" },
  subscriptionDataRowGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px dashed rgba(148, 163, 184, 0.3)", paddingTop: "10px" },
  subGridLabel: { display: "block", fontSize: "8px", fontWeight: "700", color: "#94a3b8" },
  subGridValue: { display: "block", fontSize: "11px", fontWeight: "600", marginTop: "2px" }
};