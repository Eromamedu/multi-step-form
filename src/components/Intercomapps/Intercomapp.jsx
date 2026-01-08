import React, { useState } from "react";
import "./App.css";

export default function MultiStepForm() {
  const [step, setStep] = useState(1); 

  const [formData, setFormData] = useState({
    name: "",
    // email: "",
    phone: "",
    plan: "arcade",
    billing: "monthly",
    addons: [],
  });
// PLANS
  const plans = {
    arcade: { monthly: 9, yearly: 90 },
    advanced: { monthly: 12, yearly: 120 },
    pro: { monthly: 15, yearly: 150 },
  };

  const addonsList = [
    { id: "online", title: "Online service", price: { monthly: 1, yearly: 10 } },
    { id: "storage", title: "Larger storage", price: { monthly: 2, yearly: 20 } },
    { id: "custom", title: "Customizable profile", price: { monthly: 2, yearly: 20 } },
  ];

  const toggleAddon = (id) => {
    setFormData((p) => ({
      ...p,
      addons: p.addons.includes(id)
        ? p.addons.filter((a) => a !== id)
        : [...p.addons, id],
    }));
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="container">
      <div className="sidebar">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`step ${step === n ? "active" : ""}`}>
            <div className="circle">{n}</div>
            <div className="info">
              <span>STEP {n}</span>
              <p>{["YOUR INFO", "SELECT PLAN", "ADD-ONS", "SUMMARY"][n - 1]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="form-area">
        {step === 1 && (
          <>
            <h1>Personal info</h1>
            <p className="subtitle">
              Please provide your name, email address, and phone number.
            </p>

            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Stephen King"
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. stephenking@lorem.com"
              required
            />

            <label>Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +1 234 567 890"
              required
            />

            <button className="next" onClick={next}>Next Step</button>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Select your plan</h1>
            <p className="subtitle">You have the option of monthly or yearly billing.</p>

            <div className="plan-list">
              {Object.keys(plans).map((p) => (
                <div
                  key={p}
                  onClick={() => setFormData({ ...formData, plan: p })}
                  className={`plan ${formData.plan === p ? "selected" : ""}`}
                >
                  <h3>{p.toUpperCase()}</h3>
                  <p>${plans[p][formData.billing]}/{formData.billing === "monthly" ? "mo" : "yr"}</p>
                </div>
              ))}
            </div>

            <div className="toggle">
              <span className={formData.billing === "monthly" ? "active" : ""}>Monthly</span>
              <div
                className="switch"
                onClick={() =>
                  setFormData({ ...formData, billing: formData.billing === "monthly" ? "yearly" : "monthly" })
                }
              ></div>
              <span className={formData.billing === "yearly" ? "active" : ""}>Yearly</span>
            </div>

            <button className="back" onClick={back}>Go Back</button>
            <button className="next" onClick={next}>Next Step</button>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Pick add-ons</h1>
            <p className="subtitle">Add-ons help enhance your gaming experience.</p>

            <div className="addons">
              {addonsList.map((a) => (
                <div
                  key={a.id}
                  className={`addon ${formData.addons.includes(a.id) ? "checked" : ""}`}
                  onClick={() => toggleAddon(a.id)}
                >
                  <input type="checkbox" checked={formData.addons.includes(a.id)} readOnly />
                  <div>
                    <h4>{a.title}</h4>
                    <p>+${a.price[formData.billing]}/{formData.billing === "monthly" ? "mo" : "yr"}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="back" onClick={back}>Go Back</button>
            <button className="next" onClick={next}>Next Step</button>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Finishing up</h1>
            <p className="subtitle">Double‑check everything looks OK.</p>

            <div className="summary-box">
              <div className="row between">
                <div>
                  <strong>{formData.plan.toUpperCase()} ({formData.billing})</strong>
                </div>
                <p>${plans[formData.plan][formData.billing]}</p>
              </div>

              {formData.addons.map((a) => {
                const item = addonsList.find((x) => x.id === a);
                return (
                  <div key={a} className="row between sub">
                    <span>{item.title}</span>
                    <span>+${item.price[formData.billing]}</span>
                  </div>
                );
              })}

              <hr />

              <div className="row between total">
                <span>Total (per {formData.billing === "monthly" ? "month" : "year"})</span>
                <strong>
                  ${
                    plans[formData.plan][formData.billing] +
                    formData.addons.reduce(
                      (sum, id) => sum + addonsList.find((a) => a.id === id).price[formData.billing],
                      0
                    )
                  }
                </strong>
              </div>
            </div>

            <button className="back" onClick={back}>Go Back</button>
            <button className="next" onClick={() => setStep(5)}>Confirm</button>
          </>
        )}

        {step === 5 && (
          <div className="thankyou">
            <h1>Thank you!</h1>
            <p>Your subscription has been confirmed.</p>
          </div>
        )}
      </div>
    </div>
  );
}


// import React, { useState } from "react";
// import "./App.css";

// export default function MultiStepForm() {
//   const [step, setStep] = useState(1);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     plan: "arcade",
//     billing: "monthly",
//     addons: [],
//   });

//   const plans = {
//     arcade: { monthly: 9, yearly: 90 },
//     advanced: { monthly: 12, yearly: 120 },
//     pro: { monthly: 15, yearly: 150 },
//   };

//   const addonsList = [
//     { id: "online", title: "Online service", price: { monthly: 1, yearly: 10 } },
//     { id: "storage", title: "Larger storage", price: { monthly: 2, yearly: 20 } },
//     { id: "custom", title: "Customizable profile", price: { monthly: 2, yearly: 20 } },
//   ];

//   const toggleAddon = (id) => {
//     setFormData((p) => ({
//       ...p,
//       addons: p.addons.includes(id)
//         ? p.addons.filter((a) => a !== id)
//         : [...p.addons, id],
//     }));
//   };

//   const next = () => setStep((s) => s + 1);
//   const back = () => setStep((s) => s - 1);

//   return (
//     <div className="container">
//       <div className="sidebar">
//         {[1, 2, 3, 4].map((n) => (
//           <div key={n} className={`step ${step === n ? "active" : ""}`}>
//             <div className="circle">{n}</div>
//             <div className="info">
//               <span>STEP {n}</span>
//               <p>{["YOUR INFO", "SELECT PLAN", "ADD-ONS", "SUMMARY"][n - 1]}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="form-area">
//         {step === 1 && (
//           <>
//             <h1>Personal info</h1>
//             <p className="subtitle">
//               Please provide your name, email address, and phone number.
//             </p>

//             <label>Name</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g. Stephen King"
//               required
//             />

//             <label>Email Address</label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               placeholder="e.g. stephenking@lorem.com"
//               required
//             />

//             <label>Phone Number</label>
//             <input
//               type="text"
//               value={formData.phone}
//               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//               placeholder="e.g. +1 234 567 890"
//               required
//             />

//             <button className="next" onClick={next}>Next Step</button>
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <h1>Select your plan</h1>
//             <p className="subtitle">You have the option of monthly or yearly billing.</p>

//             <div className="plan-list">
//               {Object.keys(plans).map((p) => (
//                 <div
//                   key={p}
//                   onClick={() => setFormData({ ...formData, plan: p })}
//                   className={`plan ${formData.plan === p ? "selected" : ""}`}
//                 >
//                   <h3>{p.toUpperCase()}</h3>
//                   <p>${plans[p][formData.billing]}/{formData.billing === "monthly" ? "mo" : "yr"}</p>
//                 </div>
//               ))}
//             </div>

//             <div className="toggle">
//               <span className={formData.billing === "monthly" ? "active" : ""}>Monthly</span>
//               <div
//                 className="switch"
//                 onClick={() =>
//                   setFormData({ ...formData, billing: formData.billing === "monthly" ? "yearly" : "monthly" })
//                 }
//               ></div>
//               <span className={formData.billing === "yearly" ? "active" : ""}>Yearly</span>
//             </div>

//             <button className="back" onClick={back}>Go Back</button>
//             <button className="next" onClick={next}>Next Step</button>
//           </>
//         )}

//         {step === 3 && (
//           <>
//             <h1>Pick add-ons</h1>
//             <p className="subtitle">Add-ons help enhance your gaming experience.</p>

//             <div className="addons">
//               {addonsList.map((a) => (
//                 <div
//                   key={a.id}
//                   className={`addon ${formData.addons.includes(a.id) ? "checked" : ""}`}
//                   onClick={() => toggleAddon(a.id)}
//                 >
//                   <input type="checkbox" checked={formData.addons.includes(a.id)} readOnly />
//                   <div>
//                     <h4>{a.title}</h4>
//                     <p>+${a.price[formData.billing]}/{formData.billing === "monthly" ? "mo" : "yr"}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button className="back" onClick={back}>Go Back</button>
//             <button className="next" onClick={next}>Next Step</button>
//           </>
//         )}

//         {step === 4 && (
//           <>
//             <h1>Finishing up</h1>
//             <p className="subtitle">Double-check everything looks OK.</p>

//             <div className="summary-box">
//               <div className="row between">
//                 <div>
//                   <strong>{formData.plan.toUpperCase()} ({formData.billing})</strong>
//                 </div>
//                 <p>${plans[formData.plan][formData.billing]}</p>
//               </div>

//               {formData.addons.map((a) => {
//                 const item = addonsList.find((x) => x.id === a);
//                 return (
//                   <div key={a} className="row between sub">
//                     <span>{item.title}</span>
//                     <span>+${item.price[formData.billing]}</span>
//                   </div>
//                 );
//               })}

//               <hr />

//               <div className="row between total">
//                 <span>Total (per {formData.billing === "monthly" ? "month" : "year"})</span>
//                 <strong>
//                   ${
//                     plans[formData.plan][formData.billing] +
//                     formData.addons.reduce(
//                       (sum, id) => sum + addonsList.find((a) => a.id === id).price[formData.billing],
//                       0
//                     )
//                   }
//                 </strong>
//               </div>
//             </div>

//             <button className="back" onClick={back}>Go Back</button>
//             <button className="next" onClick={() => setStep(5)}>Confirm</button>
//           </>
//         )}

//         {step === 5 && (
//           <div className="thankyou">
//             <h1>Thank you!</h1>
//             <p>Your subscription has been confirmed.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }








// import React from "react";
// import "./App.css";

// export default function MultiStepForm() {
//   return (
//     <div className="container">
//       <div className="sidebar">
//         <div className="step active">
//           <div className="circle">1</div>
//           <div className="info">
//             <span>STEP 1</span>
//             <p>YOUR INFO</p>
//           </div>
//         </div>

//         <div className="step">
//           <div className="circle">2</div>
//           <div className="info">
//             <span> STEP 2  </span>
//             <p> SELECT PLAN </p>
//           </div>
//         </div>

//         <div className="step">
//           <div className="circle">3</div>
//           <div className="info">
//             <span>STEP 3</span>
//             <p>ADD-ONS</p>
//           </div>
//         </div>

//         <div className="step">
//           <div className="circle">4</div>
//           <div className="info">
//             <span>STEP 4</span>
//             <p>SUMMARY</p>
//           </div>
//         </div>
//       </div>

//       <div className="form-area">
//         <h1>Personal info</h1>
//         <p className="subtitle">
//           Please provide your name, email address, and phone number.
//         </p>

//         <form>
//           <label>Name</label>
//           <input type="text" placeholder="e.g. Stephen King" required />

//           <label>Email Address</label>
//           <input
//             type="email"
//             placeholder="e.g. stephenking@lorem.com"
//             required
//           />

//           <label>Phone Number</label>
//           <input type="text" placeholder="e.g. +1 234 567 890" required />

//           <button className="next">Next Step</button>
//         </form>
//       </div>
//     </div>
//   );
// }
  