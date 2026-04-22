// Vercel serverless function for form submissions
// Fixed version with correct API token and simplified approach

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    console.log('Form data received:', formData);
    
    // Verify reCAPTCHA
    if (!formData.recaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification required' });
    }
    
    const recaptchaValid = await verifyRecaptcha(formData.recaptcha);
    if (!recaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }
    
    // Monday.com configuration
    const MONDAY_API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.W-ZOg1y2xo5m7Fe7QsAJftmKb9d0Sw9CYXvGI3N1b-o';
    const BOARD_ID = '18397890327';
    
    // Create Monday.com item using simplified approach that was working
    const mondayResult = await createMondayItem(formData, MONDAY_API_TOKEN, BOARD_ID);
    console.log('Monday.com result:', mondayResult);
    
    // Send email notifications using email-only handler (no Monday.com duplication)
    let emailStatus = 'success';
    try {
      await sendEmailNotifications(formData);
    } catch (emailError) {
      console.error('Email error:', emailError);
      emailStatus = 'failed';
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Thank you for your interest, one of our specialists will contact you shortly.',
      mondayItemId: mondayResult?.data?.create_item?.id,
      emailStatus: emailStatus
    });

  } catch (error) {
    console.error('Form submission error:', error);
    
    // Try to send email even if Monday.com fails
    try {
      await sendEmailNotifications(req.body);
    } catch (emailError) {
      console.error('Email fallback failed:', emailError);
    }
    
    return res.status(500).json({ 
      error: 'Error processing form submission',
      details: error.message 
    });
  }
}

async function createMondayItem(formData, apiToken, boardId) {
  const { firstName, lastName, email, phone, netWorth, accredited, interest, message } = formData;
  
  const mutation = `
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
        name
      }
    }
  `;

  // Map to individual Monday.com columns
  const columnValues = {
    "text": firstName,                        // Name column
    "text_mm0asa1p": new Date().toLocaleDateString('en-US'), // Date column
    "text_mm04w6jq": email,                 // Email column
    "text_mm04fbs8": accredited || '',      // Accredited column  
    "text_mm06s86v": phone, // Phone column (correct text column ID)
    "text_mm02dymw": netWorth || '',        // Net Worth column
    "text_mm044z4k": interest || '',        // Interest column
    "text_mm026pc4": message || ''          // Message column
  };

  const variables = {
    boardId: boardId,
    itemName: `${firstName} ${lastName}`,
    columnValues: JSON.stringify(columnValues)
  };
  
  console.log('Monday.com request:', { boardId, itemName: variables.itemName, columnValues });

  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: mutation,
      variables: variables
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Monday.com API Error:', { status: response.status, body: errorText });
    throw new Error(`Monday.com API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    console.error('Monday.com GraphQL errors:', result.errors);
    throw new Error(`Monday.com error: ${result.errors[0].message}`);
  }
  
  return result;
}

async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeB5sQsAAAAAKrSwpvXgHSx-PsIrbwk2VyQtuQZ'; // Production secret key
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });
    
    const result = await response.json();
    console.log('reCAPTCHA verification result:', result);
    
    return result.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

async function sendEmailNotifications(formData) {
  const { firstName, lastName, email, phone, netWorth, accredited, interest, message, smsConsent } = formData;
  
  // Use email-only PHP handler that ONLY sends emails (no Monday.com submissions)
  try {
    const response = await fetch('https://f0h.ab3.myftpupload.com/form-handler.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        netWorth,
        accredited,
        interest,
        message,
        smsConsent,
        emailOnly: true  // Tell PHP handler to skip Monday.com submission
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Email-only handler result:', result);
      
      // Check if emails were sent successfully
      if (result.results?.email_result?.success) {
        console.log('Emails sent successfully via email-only handler');
        return true;
      } else {
        console.log('Email-only handler reported failure:', result.results?.email_result);
        throw new Error('Email-only handler failed');
      }
    } else {
      throw new Error(`Email server returned ${response.status}`);
    }
  } catch (error) {
    console.error('Email notification failed:', error);
    throw new Error('Email notification failed');
  }
}