
const scrollReveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 150;
  
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', scrollReveal);
  
  function loadServices() {
    const container = document.getElementById('services-container');
    const services = [];
    services.forEach(service => {
      const card = `
        <div class="col-md-4">
            <div class="card service-card h-100" id="\${service.serviceEnglish.replace(/\s+/g, '-').toLowerCase()}">
                <img src="\${service.image}" class="card-img-top" alt="\${service.title}">
                <div class="card-body text-center">
                    <h5 class="card-title">\${service.title}</h5>
                    <p class="card-text">\${service.description}</p>
                    <button class="btn btn-primary" 
                            data-bs-toggle="modal" 
                            data-bs-target="#orderModal"
                            data-service="\${service.serviceEnglish}">
                        Order Service
                    </button>
                </div>
            </div>
        </div>
      `;
      container.innerHTML += card;
    });
  }
  
  function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-card');
        }
      });
    }, { threshold: 0.1 });
  
    document.querySelectorAll('.service-card').forEach(card => {
      observer.observe(card);
    });
  }
  
  let orders = JSON.parse(localStorage.getItem('orders')) || {};
  
  function generateOrderId() {
    return 'DIGI-' + Date.now();
  }
  
  function showError(input, message) {
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains("text-danger")) {
      errorDiv = document.createElement("div");
      errorDiv.className = "text-danger mt-1";
      input.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  }
  
  function clearErrors(form) {
    form.querySelectorAll(".text-danger").forEach(el => el.remove());
  }
  
  function showAlert(containerId, type, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    const icon = type === 'success' ? '✅' : '❌';
    container.innerHTML = `
        <div class="alert alert-\${type} alert-dismissible fade show" role="alert">
            <strong>\${icon}</strong> \${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  }
  
  async function sendOrder(e) {
    e.preventDefault();
    const form = e.target;
    clearErrors(form);
  
    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const serviceInput = form.querySelector('[name="service"]');
    const btn = form.querySelector('button[type="submit"]');
  
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const service = serviceInput.value.trim();
  
    let hasError = false;
  
    if (!name) {
      showError(nameInput, "Veuillez renseigner ce champ.");
      hasError = true;
    }
    if (!phone) {
      showError(phoneInput, "Veuillez renseigner ce champ.");
      hasError = true;
    } else if (!/^\d{8}$/.test(phone)) {
      showError(phoneInput, "Numéro invalide (8 chiffres).");
      hasError = true;
    }
    if (!email) {
      showError(emailInput, "Veuillez renseigner ce champ.");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailInput, "Email invalide.");
      hasError = true;
    }
    if (!service) {
      showError(serviceInput, "Veuillez sélectionner un service.");
      hasError = true;
    }
    if (hasError) return;
  
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> جاري الإرسال...`;
  
    const orderDetails = {
      name,
      phone,
      email,
      service,
      status: 'Under Review',
      date: new Date().toLocaleDateString()
    };
  
    try {
      await emailjs.send('service_rknfm29', 'template_bzv0sec', {
        name, email, phone, service
      }, 'p5SDuN6lV5vuNjZ8D');
  
      const orderId = generateOrderId();
      orders[orderId] = orderDetails;
      localStorage.setItem('orders', JSON.stringify(orders));
  
      showAlert('orderResult', 'success', `تم إرسال الطلب بنجاح! رقم الطلب: \${orderId}`);
      bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
      form.reset();
    } catch (err) {
      showAlert('orderResult', 'danger', "خطأ: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Order';
    }
  }
  
  function handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    clearErrors(form);
  
    const nameInput = form.querySelector('[name="contact-name"]');
    const phoneInput = form.querySelector('[name="contact-phone"]');
    const messageInput = form.querySelector('[name="contact-message"]');
    const btn = form.querySelector('button[type="submit"]');
  
    let hasError = false;
  
    if (!nameInput.value.trim()) {
      showError(nameInput, "Veuillez renseigner ce champ.");
      hasError = true;
    }
    if (!phoneInput.value.trim()) {
      showError(phoneInput, "Veuillez renseigner ce champ.");
      hasError = true;
    } else if (!/^\d{8}$/.test(phoneInput.value.trim())) {
      showError(phoneInput, "Numéro invalide (8 chiffres).");
      hasError = true;
    }
    if (!messageInput.value.trim()) {
      showError(messageInput, "Veuillez écrire un message.");
      hasError = true;
    }
    if (hasError) return;
  
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> جاري الإرسال...`;
  
    emailjs.send('service_rknfm29', 'template_bzv0sec', {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      message: messageInput.value.trim()
    }, 'p5SDuN6lV5vuNjZ8D').then(() => {
      showAlert('contactResult', 'success', 'تم إرسال الرسالة بنجاح!');
      form.reset();
    }).catch(err => {
      showAlert('contactResult', 'danger', 'خطأ: ' + err.message);
    }).finally(() => {
      btn.disabled = false;
      btn.innerHTML = 'Send Message';
    });
  }
  
  function setupSponsorNavScroll() {
    const sponsorLink = document.querySelector('#nav-sponsor');
    if (sponsorLink) {
      sponsorLink.addEventListener('click', (e) => {
        e.preventDefault();
        const sponsorCard = document.getElementById('sponsor');
        if (sponsorCard) {
          sponsorCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    emailjs.init('p5SDuN6lV5vuNjZ8D');
  
    loadServices();
    setupAnimations();
    setupSponsorNavScroll();
  
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', sendOrder);
    }
  
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactForm);
    }
  
    document.getElementById('orderModal')?.addEventListener('show.bs.modal', event => {
      const service = event.relatedTarget?.getAttribute('data-service');
      document.getElementById('selectedService').value = service;
    });
  
    document.getElementById('trackForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderId = document.querySelector('#trackForm input').value;
      const resultDiv = document.getElementById('trackResult');
  
      if (orders[orderId]) {
        resultDiv.innerHTML = `
          <div class="alert alert-success">
              <h5>Statut commande #\${orderId}</h5>
              <p>Service : \${orders[orderId].service}</p>
              <p>Statut : \${orders[orderId].status}</p>
              <p>Date : \${orders[orderId].date}</p>
          </div>
        `;
      } else {
        resultDiv.innerHTML = '<div class="alert alert-danger">ID invalide</div>';
      }
    });
  
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      header.classList.toggle('shadow-lg', window.scrollY > 50);
    });
  }); 
  
