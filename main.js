document.addEventListener("DOMContentLoaded", function () {
  // State variables
  let currentStep = 1;
  const totalSteps = 4;
  let billingCycle = "monthly";
  let selectedPlan = null;
  let selectedAddons = [];

  // DOM Elements
  const steps = document.querySelectorAll(".step");
  const formSteps = document.querySelectorAll(".form-step");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  const billingToggle = document.getElementById("billing-toggle");
  const monthlyLabel = document.getElementById("monthly");
  const yearlyLabel = document.getElementById("yearly");
  const planOptions = document.querySelectorAll(".plan-option");
  const addonOptions = document.querySelectorAll(".addon-option");
  const changePlanBtn = document.querySelector(".change-plan");
  const formNavigation = document.querySelector(".form-navigation");

  // Form Inputs
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  // Initialize
  updateNavButtons();
  addEventListeners();

  function addEventListeners() {
    btnNext.addEventListener("click", nextStep);
    btnBack.addEventListener("click", prevStep);
    billingToggle.addEventListener("click", toggleBillingCycle);
    planOptions.forEach((plan) =>
      plan.addEventListener("click", handlePlanSelect)
    );
    addonOptions.forEach((addon) =>
      addon.addEventListener("click", handleAddonSelect)
    );
    if (changePlanBtn)
      changePlanBtn.addEventListener("click", () => goToStep(2));
  }

  function handlePlanSelect(e) {
    planOptions.forEach((plan) => plan.classList.remove("selected"));
    this.classList.add("selected");
    selectedPlan = {
      name: this.dataset.plan,
      monthlyPrice: this.dataset.priceMonthly,
      yearlyPrice: this.dataset.priceYearly,
    };
  }

  function handleAddonSelect(e) {
    const checkbox = this.querySelector(".addon-checkbox");
    if (e.target !== checkbox) checkbox.checked = !checkbox.checked;

    const addonData = {
      name: this.dataset.addon,
      monthlyPrice: this.dataset.priceMonthly,
      yearlyPrice: this.dataset.priceYearly,
    };

    if (checkbox.checked) {
      selectedAddons.push(addonData);
      this.classList.add("selected");
    } else {
      selectedAddons = selectedAddons.filter((a) => a.name !== addonData.name);
      this.classList.remove("selected");
    }
  }

  // Add this to the existing code
  function toggleBillingCycle() {
    billingCycle = billingCycle === "monthly" ? "yearly" : "monthly";
    document.querySelector(".toggle-slider").classList.toggle("yearly-active");
    monthlyLabel.classList.toggle("active", billingCycle === "monthly");
    yearlyLabel.classList.toggle("active", billingCycle === "yearly");

    updatePlanPrices();
    updateAddonPrices();
    if (currentStep === 4) updateSummary();
  }

  function updatePlanPrices() {
    planOptions.forEach((plan) => {
      const price =
        billingCycle === "monthly"
          ? plan.dataset.priceMonthly
          : plan.dataset.priceYearly;
      const cycle = billingCycle === "monthly" ? "mo" : "yr";
      const promo = billingCycle === "yearly" ? "2 months free" : "";

      plan.querySelector(".plan-price").textContent = `$${price}/${cycle}`;
      plan.querySelector(".plan-promo").textContent = promo;
      plan.querySelector(".plan-promo").style.display =
        billingCycle === "yearly" ? "block" : "none";
    });
  }

  function updateAddonPrices() {
    addonOptions.forEach((addon) => {
      const price =
        billingCycle === "monthly"
          ? addon.dataset.priceMonthly
          : addon.dataset.priceYearly;
      const cycle = billingCycle === "monthly" ? "mo" : "yr";

      addon.querySelector(".addon-price").textContent = `+$${price}/${cycle}`;
    });
  }

  function validateStep1() {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name validation
    if (!nameInput.value.trim()) {
      document.getElementById("name-error").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("name-error").style.display = "none";
    }

    // Email validation
    if (!emailRegex.test(emailInput.value.trim())) {
      document.getElementById("email-error").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("email-error").style.display = "none";
    }

    // Phone validation
    if (!phoneInput.value.trim()) {
      document.getElementById("phone-error").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("phone-error").style.display = "none";
    }

    return isValid;
  }

  function updateSummary() {
    if (!selectedPlan) return;

    // Update plan summary
    const cycleSuffix = billingCycle === "monthly" ? "mo" : "yr";
    const planPrice =
      billingCycle === "monthly"
        ? selectedPlan.monthlyPrice
        : selectedPlan.yearlyPrice;

    document.querySelector(
      ".plan-summary-name"
    ).textContent = `${selectedPlan.name} (${billingCycle})`;
    document.querySelector(
      ".plan-summary-price"
    ).textContent = `$${planPrice}/${cycleSuffix}`;

    // Update addons summary
    const addonsContainer = document.getElementById("addons-summary-container");
    addonsContainer.innerHTML = "";
    selectedAddons.forEach((addon) => {
      const price =
        billingCycle === "monthly" ? addon.monthlyPrice : addon.yearlyPrice;
      const div = document.createElement("div");
      div.className = "addon-summary";
      div.innerHTML = `
          <div class="addon-name">${addon.name}</div>
          <div class="addon-price-summary">+$${price}/${cycleSuffix}</div>
        `;
      addonsContainer.appendChild(div);
    });

    // Update total price
    let total = parseInt(planPrice);
    selectedAddons.forEach((addon) => {
      total += parseInt(
        billingCycle === "monthly" ? addon.monthlyPrice : addon.yearlyPrice
      );
    });
    document.querySelector(
      ".total-price"
    ).textContent = `$${total}/${cycleSuffix}`;
  }

  function goToStep(step) {
    currentStep = step;

    // Update step indicators
    steps.forEach((s, i) =>
      s.classList.toggle("active", i + 1 === currentStep)
    );

    // Show corresponding form step
    formSteps.forEach((fs, i) => {
      fs.classList.toggle("active", i + 1 === currentStep);
      if (i + 1 === 5 && currentStep === 5) {
        formNavigation.style.display = "none";
      } else {
        formNavigation.style.display = "flex";
      }
    });

    // Update navigation buttons
    updateNavButtons();

    // Special handling for summary step
    if (currentStep === 4) updateSummary();
  }

  function updateNavButtons() {
    btnBack.style.visibility = currentStep === 1 ? "hidden" : "visible";

    if (currentStep === totalSteps) {
      btnNext.textContent = "Confirm";
      btnNext.classList.add("btn-confirm");
      btnNext.classList.remove("btn-next");
    } else {
      btnNext.textContent = "Next Step";
      btnNext.classList.remove("btn-confirm");
      btnNext.classList.add("btn-next");
    }
  }

  function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !selectedPlan) {
      alert("Please select a plan to continue.");
      return;
    }
    if (currentStep === totalSteps) return goToStep(5);
    goToStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 1) goToStep(currentStep - 1);
  }
});
