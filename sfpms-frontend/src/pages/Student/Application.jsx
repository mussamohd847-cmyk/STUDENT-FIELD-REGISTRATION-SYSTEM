import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

function ProfileSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="section-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function Application() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [countryId, setCountryId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");

  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    nationalId: "",

    phone: "",
    email: "",
    alternativePhone: "",
    address: "",
    region: "",
    district: "",
    ward: "",

    studentId: "",
    programme: "",
    department: "",
    yearOfStudy: "",
    academicYear: "",
    institution: "",

    preferredOrganization: "eGAZ",
    organizationType: "Government",
    preferredLocation: "Zanzibar",
    placementStartDate: "",
    placementEndDate: "",
    placementDuration: "",
    preferredDepartment: "",
    skills: "",
    placementReason: "",

    applicationLetter: null,
    cv: null,
    studentIdCopy: null,

    declaration: false,
  });

  const getLocationList = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.locations)) {
      return response.locations;
    }

    if (Array.isArray(response?.data?.locations)) {
      return response.data.locations;
    }

    return [];
  };

  useEffect(() => {
    let cancelled = false;

    const loadCountries = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError("");

        const response = await api.get("/locations/?level=COUNTRY");
        const data = getLocationList(response);

        if (!cancelled) {
          setCountries(data);
        }
      } catch (error) {
        console.error("Countries loading error:", error);

        if (!cancelled) {
          setCountries([]);
          setLocationsError(
            "Could not load countries. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!countryId) {
      setRegions([]);
      return;
    }

    let cancelled = false;

    const loadRegions = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError("");

        const response = await api.get(
          `/locations/?level=REGION&parent_id=${encodeURIComponent(countryId)}`
        );

        const data = getLocationList(response);

        if (!cancelled) {
          setRegions(data);
        }
      } catch (error) {
        console.error("Regions loading error:", error);

        if (!cancelled) {
          setRegions([]);
          setLocationsError("Could not load regions.");
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadRegions();

    return () => {
      cancelled = true;
    };
  }, [countryId]);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }

    let cancelled = false;

    const loadDistricts = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError("");

        const response = await api.get(
          `/locations/?level=DISTRICT&parent_id=${encodeURIComponent(regionId)}`
        );

        const data = getLocationList(response);

        if (!cancelled) {
          setDistricts(data);
        }
      } catch (error) {
        console.error("Districts loading error:", error);

        if (!cancelled) {
          setDistricts([]);
          setLocationsError("Could not load districts.");
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadDistricts();

    return () => {
      cancelled = true;
    };
  }, [regionId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }

    let cancelled = false;

    const loadWards = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError("");

        const response = await api.get(
          `/locations/?level=WARD&parent_id=${encodeURIComponent(districtId)}`
        );

        const data = getLocationList(response);

        if (!cancelled) {
          setWards(data);
        }
      } catch (error) {
        console.error("Wards loading error:", error);

        if (!cancelled) {
          setWards([]);
          setLocationsError("Could not load wards.");
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadWards();

    return () => {
      cancelled = true;
    };
  }, [districtId]);

  const handleCountryChange = (e) => {
    const id = e.target.value;

    const selected = countries.find(
      (item) => String(item.id) === String(id)
    );

    setCountryId(id);

    setRegionId("");
    setDistrictId("");
    setWardId("");

    setRegions([]);
    setDistricts([]);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      nationality: selected?.name || prev.nationality,
      region: "",
      district: "",
      ward: "",
    }));

    setLocationsError("");
  };

  const handleRegionChange = (e) => {
    const id = e.target.value;

    const selected = regions.find(
      (item) => String(item.id) === String(id)
    );

    setRegionId(id);

    setDistrictId("");
    setWardId("");

    setDistricts([]);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      region: selected?.name || "",
      district: "",
      ward: "",
    }));

    setLocationsError("");
  };

  const handleDistrictChange = (e) => {
    const id = e.target.value;

    const selected = districts.find(
      (item) => String(item.id) === String(id)
    );

    setDistrictId(id);

    setWardId("");
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));

    setLocationsError("");
  };

  const handleWardChange = (e) => {
    const id = e.target.value;

    const selected = wards.find(
      (item) => String(item.id) === String(id)
    );

    setWardId(id);

    setFormData((prev) => ({
      ...prev,
      ward: selected?.name || "",
    }));

    setLocationsError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0] || null
          : value,
    }));
  };

  const getFileName = (file) => {
    if (!file) return "No file selected";
    if (typeof file === "string") return file;
    return file.name;
  };

  const saveDraft = () => {
    const dataToSave = {
      ...formData,
      applicationLetter: getFileName(formData.applicationLetter),
      cv: getFileName(formData.cv),
      studentIdCopy: getFileName(formData.studentIdCopy),
      countryId,
      regionId,
      districtId,
      wardId,
    };

    localStorage.setItem(
      "sfpms_student_application",
      JSON.stringify(dataToSave)
    );

    alert("Application draft saved successfully.");
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.gender ||
        !formData.dateOfBirth ||
        !formData.nationality
      ) {
        alert("Please complete all required personal information.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (
        !formData.phone ||
        !formData.email ||
        !formData.address ||
        !countryId ||
        !regionId ||
        !districtId
      ) {
        alert("Please complete all required contact and location information.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (
        !formData.studentId ||
        !formData.programme ||
        !formData.department ||
        !formData.yearOfStudy ||
        !formData.academicYear ||
        !formData.institution
      ) {
        alert("Please complete all required academic information.");
        return false;
      }
    }

    if (currentStep === 4) {
      if (
        !formData.placementStartDate ||
        !formData.placementEndDate ||
        !formData.preferredDepartment ||
        !formData.placementReason
      ) {
        alert("Please complete all required field placement information.");
        return false;
      }
    }

    if (currentStep === 5) {
      if (
        !formData.applicationLetter ||
        !formData.cv ||
        !formData.studentIdCopy
      ) {
        alert("Please upload all required documents.");
        return false;
      }
    }

    if (currentStep === 6 && !formData.declaration) {
      alert("Please accept the declaration before submitting.");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    const storedUser = JSON.parse(
      localStorage.getItem("sfpms_user") || "null"
    );

    if (!storedUser?.id) {
      alert("Student account information was not found. Please login again.");
      navigate("/login");
      return;
    }

    const data = new FormData();

    data.append("student_id", storedUser.id);

    const fieldMapping = {
      firstName: "first_name",
      middleName: "middle_name",
      lastName: "last_name",
      gender: "gender",
      dateOfBirth: "date_of_birth",
      nationality: "nationality",
      nationalId: "national_id",

      phone: "phone",
      email: "email",
      alternativePhone: "alternative_phone",
      address: "address",
      region: "region",
      district: "district",
      ward: "ward",

      studentId: "student_number",
      programme: "programme",
      department: "department",
      yearOfStudy: "year_of_study",
      academicYear: "academic_year",
      institution: "institution",

      preferredOrganization: "preferred_organization",
      organizationType: "organization_type",
      preferredLocation: "preferred_location",
      placementStartDate: "placement_start_date",
      placementEndDate: "placement_end_date",
      placementDuration: "placement_duration",
      preferredDepartment: "preferred_department",
      skills: "skills",
      placementReason: "placement_reason",

      applicationLetter: "application_letter",
      cv: "cv",
      studentIdCopy: "student_id_copy",
    };

    Object.entries(fieldMapping).forEach(([frontendKey, backendKey]) => {
      const value = formData[frontendKey];

      if (value instanceof File) {
        data.append(backendKey, value);
      } else if (value !== null && value !== undefined && value !== "") {
        data.append(backendKey, value);
      }
    });

    data.set("preferred_organization", "eGAZ");
    data.set("organization_type", "Government");
    data.set("preferred_location", "Zanzibar");

    try {
      setSubmitting(true);

      const response = await api.post("/applications/", data);

      const message =
        response?.message ||
        response?.data?.message ||
        "Application submitted successfully. Your application is now pending review.";

      const application =
        response?.application ||
        response?.data?.application ||
        null;

      localStorage.removeItem("sfpms_student_application");

      localStorage.setItem("sfpms_application_submitted", "true");

      localStorage.setItem(
        "sfpms_student_application",
        JSON.stringify({
          submitted: true,
          status: "PENDING",
          application,
        })
      );

      alert(message);

      navigate("/student/dashboard");
    } catch (error) {
      console.error("Application submission error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit application. Please try again.";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal" },
    { number: 2, title: "Contact" },
    { number: 3, title: "Academic" },
    { number: 4, title: "Placement" },
    { number: 5, title: "Documents" },
    { number: 6, title: "Review" },
  ];

  const progress = (currentStep / 6) * 100;

  return (
    <>
      <style>{`
        .application-page{min-height:100vh;background:#f4f7fb}
        .application-main{margin-left:240px;width:calc(100% - 240px);min-height:100vh}
        .application-topbar{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:22px 35px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 15px rgba(37,99,235,.18)}
        .application-title{margin:0;font-size:23px;font-weight:700}
        .application-subtitle{margin:5px 0 0;font-size:13px;opacity:.88}
        .portal-badge{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);padding:9px 16px;border-radius:30px;font-size:13px;font-weight:600}
        .application-container{width:100%;max-width:1150px;margin:0 auto;padding:30px 25px 60px}
        .progress-card,.form-card{background:#fff;border:1px solid #edf0f5;box-shadow:0 5px 25px rgba(15,23,42,.06)}
        .progress-card{border-radius:18px;padding:24px;margin-bottom:24px}
        .progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}
        .progress-header h6{margin:0;font-weight:700;color:#172033}
        .progress-header span{color:#2563eb;font-weight:700;font-size:14px}
        .custom-progress{height:8px;background:#e9eef7;border-radius:20px;overflow:hidden}
        .custom-progress-bar{height:100%;background:linear-gradient(90deg,#2563eb,#1d4ed8);border-radius:20px;transition:width .3s}
        .steps-wrapper{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:25px}
        .step-item{text-align:center}
        .step-circle{width:43px;height:43px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;background:#eef2f7;color:#7b8495}
        .step-item.active .step-circle,.step-item.completed .step-circle{background:#2563eb;color:#fff}
        .step-title{font-size:12px;color:#7b8495;font-weight:500}
        .step-item.active .step-title,.step-item.completed .step-title{color:#2563eb;font-weight:700}
        .form-card{border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.07)}
        .form-card-header{padding:25px 30px;border-bottom:1px solid #edf0f5;display:flex;align-items:center;gap:15px}
        .section-icon{width:50px;height:50px;border-radius:14px;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:23px}
        .section-action-icon{width:24px;height:24px;display:block}
        .form-card-header h4{margin:0;font-weight:700;color:#172033}
        .form-card-header p{margin:4px 0 0;color:#7b8495;font-size:13px}
        .form-content{padding:30px}
        .form-group{margin-bottom:20px}
        .form-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:8px}
        .required{color:#ef4444}
        .form-control,.form-select{width:100%;min-height:46px;border:1px solid #dce2eb;border-radius:10px;padding:10px 13px;font-size:14px;color:#263244;outline:none;transition:.2s}
        .form-control:focus,.form-select:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        textarea.form-control{min-height:120px;resize:vertical}
        .form-section-title{font-size:16px;font-weight:700;color:#172033;margin:5px 0 20px;padding-bottom:12px;border-bottom:1px solid #edf0f5}
        .organization-card{background:#f8fbff;border:1px solid #dbeafe;border-radius:16px;padding:22px;margin-bottom:20px}
        .organization-name{color:#1d4ed8;font-size:20px;font-weight:800;margin-bottom:15px}
        .organization-detail,.review-row{display:flex;justify-content:space-between;gap:20px;padding:9px 0;border-bottom:1px solid #e5edf8;font-size:13px}
        .organization-detail:last-child,.review-row:last-child{border-bottom:none}
        .organization-label,.review-label{color:#6b7280;font-weight:600}
        .organization-value,.review-value{color:#263244;font-weight:600;text-align:right}
        .upload-card{border:1px dashed #b9c5d8;border-radius:14px;padding:20px;background:#fafcff}
        .upload-icon{width:45px;height:45px;border-radius:12px;background:#eff6ff;color:#2563eb;margin-bottom:10px}
        .upload-title{font-weight:700;font-size:14px;color:#263244}
        .upload-description{font-size:12px;color:#7b8495;margin-bottom:12px}
        .review-card{background:#f8fafc;border:1px solid #e6ebf2;border-radius:14px;padding:20px;margin-bottom:20px}
        .review-card h6{color:#2563eb;font-weight:700;margin-bottom:15px}
        .declaration-card{padding:18px;border-radius:14px;background:#eff6ff;border:1px solid #dbeafe;display:flex;gap:12px;align-items:flex-start}
        .declaration-card input{margin-top:3px;width:17px;height:17px}
        .declaration-card label{font-size:13px;line-height:1.6;color:#374151}
        .form-footer{padding:20px 30px;border-top:1px solid #edf0f5;display:flex;justify-content:space-between;align-items:center;background:#fcfdff}
        .btn-application{border:none;border-radius:10px;padding:11px 20px;font-size:14px;font-weight:600;cursor:pointer}
        .btn-back{background:#eef2f7;color:#374151}
        .btn-next{background:#1f49a5;color:#fff}
        .btn-save{background:#fff;color:#0f3085;border:1px solid #527cd7;margin-right:10px}
        .btn-submit{background:#16a34a;color:#fff}
        .btn-submit:disabled{background:#86efac;cursor:not-allowed}
        .location-error{color:#dc2626;font-size:13px;margin-bottom:15px}
        @media(max-width:992px){.application-main{margin-left:0;width:100%}}
        @media(max-width:768px){.portal-badge{display:none}.application-container{padding:20px 15px 40px}.steps-wrapper{grid-template-columns:repeat(3,1fr);gap:18px}.form-content{padding:20px}.form-card-header{padding:20px}.form-footer{padding:18px 20px;flex-direction:column;gap:12px;align-items:stretch}.footer-left,.footer-right{width:100%}.btn-application{width:100%}.btn-save{margin:0 0 10px}.organization-detail{flex-direction:column;gap:4px}.organization-value{text-align:left}}
        @media(max-width:480px){.application-title{font-size:18px}.application-subtitle{font-size:11px}.progress-card{padding:18px}.steps-wrapper{grid-template-columns:repeat(2,1fr)}.review-row{flex-direction:column;gap:5px}.review-value{text-align:left}}
      `}</style>

      <div className="application-page">
        <Sidebar />

        <main className="application-main">
          <div className="application-topbar">
            <div>
              <h4 className="application-title">
                Field Placement Application
              </h4>
              <p className="application-subtitle">
                Complete your field placement application step by step
              </p>
            </div>

            <div className="portal-badge">Student Portal</div>
          </div>

          <div className="application-container">
            <div className="progress-card">
              <div className="progress-header">
                <h6>Application Progress</h6>
                <span>Step {currentStep} of 6</span>
              </div>

              <div className="custom-progress">
                <div
                  className="custom-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="steps-wrapper">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`step-item ${
                      currentStep === step.number
                        ? "active"
                        : currentStep > step.number
                        ? "completed"
                        : ""
                    }`}
                  >
                    <div className="step-circle">{step.number}</div>
                    <div className="step-title">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-card">
                {currentStep === 1 && (
                  <>
                    <div className="form-card-header">
                      <div className="section-icon">
                        <ProfileSectionIcon />
                      </div>

                      <div>
                        <h4>Personal Information</h4>
                        <p>Provide your basic personal details</p>
                      </div>
                    </div>

                    <div className="form-content">
                      <h6 className="form-section-title">
                        Student Details
                      </h6>

                      <div className="row">
                        {[
                          [
                            "firstName",
                            "First Name",
                            "Enter first name",
                            true,
                          ],
                          [
                            "middleName",
                            "Middle Name",
                            "Enter middle name",
                            false,
                          ],
                          [
                            "lastName",
                            "Last Name",
                            "Enter last name",
                            true,
                          ],
                        ].map(
                          ([name, label, placeholder, required]) => (
                            <div className="col-md-4" key={name}>
                              <div className="form-group">
                                <label className="form-label">
                                  {label}{" "}
                                  {required && (
                                    <span className="required">*</span>
                                  )}
                                </label>

                                <input
                                  type="text"
                                  name={name}
                                  value={formData[name]}
                                  onChange={handleChange}
                                  className="form-control"
                                  placeholder={placeholder}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              Gender{" "}
                              <span className="required">*</span>
                            </label>

                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              Date of Birth{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              Nationality{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="nationality"
                              value={formData.nationality}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. Tanzanian"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          National ID / NIDA Number
                        </label>

                        <input
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter National ID number"
                        />
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="form-card-header">
                      <div className="section-icon">☎</div>

                      <div>
                        <h4>Contact Information</h4>
                        <p>Provide your current contact details</p>
                      </div>
                    </div>

                    <div className="form-content">
                      <h6 className="form-section-title">
                        Contact Details
                      </h6>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Phone Number{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. 0712345678"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Email Address{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="example@email.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Alternative Phone Number
                        </label>

                        <input
                          type="tel"
                          name="alternativePhone"
                          value={formData.alternativePhone}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Alternative phone number"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Current Address{" "}
                          <span className="required">*</span>
                        </label>

                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Enter your current address"
                        />
                      </div>

                      {locationsError && (
                        <div className="location-error" role="alert">
                          {locationsError}
                        </div>
                      )}

                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">
                              Country{" "}
                              <span className="required">*</span>
                            </label>

                            <select
                              className="form-select"
                              value={countryId}
                              onChange={handleCountryChange}
                              disabled={locationsLoading}
                              required
                            >
                              <option value="">
                                {locationsLoading
                                  ? "Loading countries..."
                                  : "Select country"}
                              </option>

                              {countries.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">
                              Region{" "}
                              <span className="required">*</span>
                            </label>

                            <select
                              className="form-select"
                              value={regionId}
                              onChange={handleRegionChange}
                              disabled={
                                !countryId || locationsLoading
                              }
                              required
                            >
                              <option value="">
                                {!countryId
                                  ? "Select country first"
                                  : locationsLoading
                                  ? "Loading regions..."
                                  : "Select region"}
                              </option>

                              {regions.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">
                              District{" "}
                              <span className="required">*</span>
                            </label>

                            <select
                              className="form-select"
                              value={districtId}
                              onChange={handleDistrictChange}
                              disabled={
                                !regionId || locationsLoading
                              }
                              required
                            >
                              <option value="">
                                {!regionId
                                  ? "Select region first"
                                  : locationsLoading
                                  ? "Loading districts..."
                                  : "Select district"}
                              </option>

                              {districts.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="form-group">
                            <label className="form-label">
                              Ward
                            </label>

                            <select
                              className="form-select"
                              value={wardId}
                              onChange={handleWardChange}
                              disabled={
                                !districtId || locationsLoading
                              }
                            >
                              <option value="">
                                {!districtId
                                  ? "Select district first"
                                  : locationsLoading
                                  ? "Loading wards..."
                                  : "Select ward"}
                              </option>

                              {wards.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="form-card-header">
                      <div className="section-icon">🎓</div>

                      <div>
                        <h4>Academic Information</h4>
                        <p>
                          Provide your current academic information
                        </p>
                      </div>
                    </div>

                    <div className="form-content">
                      <h6 className="form-section-title">
                        Academic Details
                      </h6>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Student ID{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="studentId"
                              value={formData.studentId}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="Enter student ID"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Programme{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="programme"
                              value={formData.programme}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. Bachelor of IT"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Department{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="Department"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Year of Study{" "}
                              <span className="required">*</span>
                            </label>

                            <select
                              name="yearOfStudy"
                              value={formData.yearOfStudy}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="">Select year</option>
                              <option value="Year 1">Year 1</option>
                              <option value="Year 2">Year 2</option>
                              <option value="Year 3">Year 3</option>
                              <option value="Year 4">Year 4</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Academic Year{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="academicYear"
                              value={formData.academicYear}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. 2026/2027"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Institution{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="institution"
                              value={formData.institution}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="University / College"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="form-card-header">
                     
                      <div>
                        <h4>Field Placement Details</h4>
                        <p>
                          Your field placement organization is
                          assigned to eGAZ
                        </p>
                      </div>
                    </div>

                    <div className="form-content">
                      <h6 className="form-section-title">
                        Field Placement Organization
                      </h6>

                      <div className="organization-card">
                        <div className="organization-name">
                          eGAZ
                        </div>

                        {[
                          ["Organization Type", "Government"],
                          [
                            "P.O. Box",
                            "P.O. Box 800 Zanzibar, Tanzania",
                          ],
                          [
                            "Tel",
                            "+255 (0) 24 22 35688 / +255 (0) 24 22 35689",
                          ],
                          ["Email", "info@egaz.go.tz"],
                          ["Website", "www.egaz.go.tz"],
                        ].map(([label, value]) => (
                          <div
                            className="organization-detail"
                            key={label}
                          >
                            <span className="organization-label">
                              {label}
                            </span>

                            <span className="organization-value">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Preferred Location
                            </label>

                            <input
                              type="text"
                              value="Zanzibar"
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">
                              Preferred Department{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="text"
                              name="preferredDepartment"
                              value={
                                formData.preferredDepartment
                              }
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. ICT Department"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              Start Date{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="date"
                              name="placementStartDate"
                              value={
                                formData.placementStartDate
                              }
                              onChange={handleChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              End Date{" "}
                              <span className="required">*</span>
                            </label>

                            <input
                              type="date"
                              name="placementEndDate"
                              value={
                                formData.placementEndDate
                              }
                              onChange={handleChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="form-group">
                            <label className="form-label">
                              Duration
                            </label>

                            <input
                              type="text"
                              name="placementDuration"
                              value={
                                formData.placementDuration
                              }
                              onChange={handleChange}
                              className="form-control"
                              placeholder="e.g. 8 weeks"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Skills / Areas of Interest
                        </label>

                        <textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Describe your skills and areas of interest..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Reason for Choosing this Placement{" "}
                          <span className="required">*</span>
                        </label>

                        <textarea
                          name="placementReason"
                          value={formData.placementReason}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Explain why you are interested in this placement..."
                        />
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 5 && (
                  <>
                    <div className="form-card-header">
                      

                      <div>
                        <h4>Supporting Documents</h4>
                        <p>
                          Upload the documents required for your
                          application
                        </p>
                      </div>
                    </div>

                    <div className="form-content">
                      <h6 className="form-section-title">
                        Required Documents
                      </h6>

                      <div className="row">
                        {[
                          [
                            "applicationLetter",
                            "Application Letter",
                            "PDF or DOC/DOCX",
                            ".pdf,.doc,.docx",
                          ],
                          [
                            "cv",
                            "Curriculum Vitae",
                            "PDF or DOC/DOCX",
                            ".pdf,.doc,.docx",
                          ],
                          [
                            "studentIdCopy",
                            "Student ID Copy",
                            "PDF, JPG or PNG",
                            ".pdf,.jpg,.jpeg,.png",
                          ],
                        ].map(
                          ([
                            name,
                            title,
                            description,
                            accept,
                          ]) => (
                            <div
                              className="col-md-4"
                              key={name}
                            >
                              <div className="upload-card">
                                <div className="upload-icon">
                                  📄
                                </div>

                                <div className="upload-title">
                                  {title}
                                </div>

                                <div className="upload-description">
                                  {description}
                                </div>

                                <input
                                  type="file"
                                  name={name}
                                  onChange={handleChange}
                                  className="form-control"
                                  accept={accept}
                                />

                                {formData[name] && (
                                  <small className="text-success d-block mt-2">
                                    {getFileName(
                                      formData[name]
                                    )}
                                  </small>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 6 && (
                  <>
                    <div className="form-card-header">
                      <div className="section-icon">✓</div>

                      <div>
                        <h4>Review & Submit</h4>
                        <p>
                          Review your information before
                          submitting
                        </p>
                      </div>
                    </div>

                    <div className="form-content">
                      {[
                        [
                          "Personal Information",
                          [
                            [
                              "Full Name",
                              `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
                            ],
                            [
                              "Gender",
                              formData.gender ||
                                "Not provided",
                            ],
                            [
                              "Date of Birth",
                              formData.dateOfBirth ||
                                "Not provided",
                            ],
                            [
                              "Nationality",
                              formData.nationality ||
                                "Not provided",
                            ],
                          ],
                        ],
                        [
                          "Contact Information",
                          [
                            [
                              "Phone",
                              formData.phone ||
                                "Not provided",
                            ],
                            [
                              "Email",
                              formData.email ||
                                "Not provided",
                            ],
                            [
                              "Address",
                              formData.address ||
                                "Not provided",
                            ],
                            [
                              "Country",
                              countries.find(
                                (x) =>
                                  String(x.id) ===
                                  String(countryId)
                              )?.name ||
                                "Not provided",
                            ],
                            [
                              "Region",
                              formData.region ||
                                "Not provided",
                            ],
                            [
                              "District",
                              formData.district ||
                                "Not provided",
                            ],
                            [
                              "Ward",
                              formData.ward ||
                                "Not provided",
                            ],
                          ],
                        ],
                        [
                          "Academic Information",
                          [
                            [
                              "Student ID",
                              formData.studentId ||
                                "Not provided",
                            ],
                            [
                              "Programme",
                              formData.programme ||
                                "Not provided",
                            ],
                            [
                              "Department",
                              formData.department ||
                                "Not provided",
                            ],
                            [
                              "Year of Study",
                              formData.yearOfStudy ||
                                "Not provided",
                            ],
                          ],
                        ],
                        [
                          "Placement Information",
                          [
                            ["Organization", "eGAZ"],
                            [
                              "Organization Type",
                              "Government",
                            ],
                            ["Location", "Zanzibar"],
                            [
                              "Department",
                              formData.preferredDepartment ||
                                "Not provided",
                            ],
                            [
                              "Placement Period",
                              `${
                                formData.placementStartDate ||
                                "Not set"
                              } — ${
                                formData.placementEndDate ||
                                "Not set"
                              }`,
                            ],
                          ],
                        ],
                        [
                          "Documents",
                          [
                            [
                              "Application Letter",
                              getFileName(
                                formData.applicationLetter
                              ),
                            ],
                            [
                              "CV",
                              getFileName(formData.cv),
                            ],
                            [
                              "Student ID",
                              getFileName(
                                formData.studentIdCopy
                              ),
                            ],
                          ],
                        ],
                      ].map(([title, rows]) => (
                        <div
                          className="review-card"
                          key={title}
                        >
                          <h6>{title}</h6>

                          {rows.map(([label, value]) => (
                            <div
                              className="review-row"
                              key={label}
                            >
                              <span className="review-label">
                                {label}
                              </span>

                              <span className="review-value">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}

                      <div className="declaration-card">
                        <input
                          type="checkbox"
                          name="declaration"
                          checked={formData.declaration}
                          onChange={handleChange}
                          id="declaration"
                        />

                        <label htmlFor="declaration">
                          I declare that the information provided
                          in this application is true and correct
                          to the best of my knowledge. I understand
                          that providing false information may
                          result in rejection of my field placement
                          application.
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-footer">
                  <div className="footer-left">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn-application btn-back"
                        onClick={previousStep}
                        disabled={submitting}
                      >
                        Previous
                      </button>
                    )}
                  </div>

                  <div className="footer-right">
                    <button
                      type="button"
                      className="btn-application btn-save"
                      onClick={saveDraft}
                      disabled={submitting}
                    >
                      Save Draft
                    </button>

                    {currentStep < 6 ? (
                      <button
                        type="button"
                        className="btn-application btn-next"
                        onClick={nextStep}
                        disabled={submitting}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn-application btn-submit"
                        disabled={submitting}
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit Application"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default Application;