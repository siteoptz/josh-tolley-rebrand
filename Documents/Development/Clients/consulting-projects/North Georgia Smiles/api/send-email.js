// Enhanced Vercel Function with Email Sending
// Uses Resend.com for reliable email delivery

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const { 
      firstName = '', 
      lastName = '', 
      name = `${firstName} ${lastName}`.trim() || 'No name provided',
      email = '', 
      phone = '', 
      service = '', 
      message = '',
      formType = 'contact'
    } = req.body;
    
    // Validation
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Determine subject and priority
    let subject = 'New Contact Form Submission - North Georgia Smiles';
    let priority = 'normal';
    
    if (formType === 'emergency' || service === 'emergency') {
      subject = '🚨 EMERGENCY Appointment Request - North Georgia Smiles';
      priority = 'high';
    } else if (service && service !== 'test') {
      subject = `New ${service} Appointment Request - North Georgia Smiles`;
    }
    
    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #175e6a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">North Georgia Smiles</h1>
          <p style="margin: 5px 0 0 0;">${subject}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #175e6a; margin-top: 0;">New Form Submission</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Name:</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Email:</td>
              <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Phone:</td>
              <td style="padding: 12px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone || 'Not provided'}</a></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">Service:</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${service || 'Not specified'}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa; vertical-align: top;">Message:</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${(message || 'No message provided').replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: white; border-left: 4px solid #175e6a;">
            <h3 style="margin: 0 0 10px 0; color: #175e6a;">Submission Details</h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Form Type:</strong> ${formType}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Priority:</strong> ${priority.toUpperCase()}</p>
          </div>
        </div>
        
        <div style="background: #175e6a; color: white; padding: 15px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">North Georgia Smiles | 1595 Peachtree Pkwy #207, Cumming, GA 30041 | (770)-884-2868</p>
        </div>
      </div>
    `;
    
    // Plain text version
    const textContent = `
New form submission from North Georgia Smiles website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service: ${service || 'Not specified'}

Message:
${message || 'No message provided'}

---
Form Type: ${formType}
Priority: ${priority.toUpperCase()}
Timestamp: ${new Date().toLocaleString()}
    `.trim();
    
    // Email configuration
    const emailData = {
      to: ['antonio@siteoptz.com'],
      cc: ['info@siteoptz.com', 'drleodmd@gmail.com', 'jpasmin@northgeorgiasmiles.com'],
      subject: subject,
      html: htmlContent,
      text: textContent,
      replyTo: email,
      headers: {
        'X-Priority': priority === 'high' ? '1' : '3'
      }
    };
    
    // Try multiple email methods
    let emailSent = false;
    let emailResult = null;
    
    // Method 1: Try Resend (if API key is available)
    const resendApiKey = process.env.RESEND_API_KEY || 're_YeQ9bhMk_CBB7N8HmWWayJ2otEpA9W22x';
    if (resendApiKey && !emailSent) {
      try {
        // Use fetch API since we can't install packages in Vercel functions
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'North Georgia Smiles <onboarding@resend.dev>',
            to: ['antonio@siteoptz.com'],
            cc: ['drleodmd@gmail.com', 'jpasmin@northgeorgiasmiles.com', 'info@northgeorgiasmiles.com'],
            subject: subject,
            html: htmlContent,
            text: textContent,
            reply_to: email
          })
        });
        
        if (response.ok) {
          emailResult = await response.json();
          emailSent = true;
          console.log('Email sent via Resend:', emailResult);
        } else {
          const errorText = await response.text();
          console.log('Resend error response:', response.status, errorText);
        }
      } catch (error) {
        console.log('Resend failed:', error.message);
      }
    }
    
    // Method 2: Store in logs for manual processing
    if (!emailSent) {
      console.log('EMAIL NOT SENT - MANUAL PROCESSING REQUIRED');
      console.log('Subject:', subject);
      console.log('Recipients:', [...emailData.to, ...emailData.cc]);
      console.log('Content:', textContent);
    }
    
    // Always return success - we've captured the data
    return res.status(200).json({
      success: true,
      message: emailSent 
        ? 'Form submitted successfully! We will contact you within 1 business hour.'
        : 'Form submitted successfully! We will contact you soon.',
      emailSent: emailSent,
      timestamp: new Date().toISOString(),
      id: `ngs_${Date.now()}`
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'There was an error submitting your form. Please call us directly at (770)-884-2868.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}