// import React, { useState } from "react";

// export const AdminLevelSelector = ({ label, options, updateOption }) => {
//     const [isAdminLevelOpen, setAdminLevelOpen] = useState(true);

//     return (
//         <div className="variable-selector">
//             <div className="variable-section">
//                 <button
//                     className="section-title"
//                     onClick={() => setAdminLevelOpen(!isAdminLevelOpen)}
//                 >
//                     Administrative Level
//                     <span
//                         className={`toggle-icon ${
//                             isAdminLevelOpen ? "open" : "closed"
//                         }`}
//                     >
//                         ▼
//                     </span>
//                 </button>
//                 {isAdminLevelOpen && (
//                     <>
//                         <div className="date-picker-list">
//                             <button
//                                 className={`dateType-selector-button ${
//                                     options.adminLevel === "Country"
//                                         ? "active"
//                                         : ""
//                                 }`}
//                                 onClick={() =>
//                                     updateOption("adminLevel", "Country")
//                                 }
//                             >
//                                 Country
//                             </button>
//                             <button
//                                 className={`dateType-selector-button ${
//                                     options.adminLevel === "Prov"
//                                         ? "active"
//                                         : ""
//                                 }`}
//                                 onClick={() =>
//                                     updateOption("adminLevel", "Prov")
//                                 }
//                             >
//                                 Province
//                             </button>
//                             <button
//                                 className={`dateType-selector-button ${
//                                     options.adminLevel === "Grid"
//                                         ? "active"
//                                         : ""
//                                 }`}
//                                 onClick={() =>
//                                     updateOption("adminLevel", "Grid")
//                                 }
//                             >
//                                 Grid
//                             </button>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminLevelSelector;


// // components/AdminLevelSelector.js
// import React from "react";

// export const AdminLevelSelector = ({ options, updateOption }) => {
//     return (
//         <div className="admin-level-selector">
//             <button
//                 className={`admin-level-btn ${options.adminLevel === "Country" ? "active" : ""}`}
//                 onClick={() => updateOption("adminLevel", "Country")}
//             >
//                 Country
//             </button>
//             <button
//                 className={`admin-level-btn ${options.adminLevel === "Prov" ? "active" : ""}`}
//                 onClick={() => updateOption("adminLevel", "Prov")}
//             >
//                 Province/State
//             </button>
//             <button
//                 className={`admin-level-btn ${options.adminLevel === "Grid" ? "active" : ""}`}
//                 onClick={() => updateOption("adminLevel", "Grid")}
//             >
//                 Grid
//             </button>
//         </div>
//     );
// };