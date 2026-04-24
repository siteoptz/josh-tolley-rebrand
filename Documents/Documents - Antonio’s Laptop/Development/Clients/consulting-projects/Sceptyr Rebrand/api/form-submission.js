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
    
    // ABSOLUTE HARD BLOCK - NO EXCEPTIONS
    if (!formData.recaptcha || formData.recaptcha.length < 100) {
      console.error('BLOCKED: No valid reCAPTCHA token provided');
      return res.status(403).json({ 
        error: 'BLOCKED: reCAPTCHA verification required. This submission has been rejected.',
        blocked: true
      });
    }
    
    console.log('Attempting reCAPTCHA verification...');
    const recaptchaResult = await verifyRecaptcha(formData.recaptcha);
    
    // Reasonable verification check - Allow most legitimate users through
    if (!recaptchaResult || !recaptchaResult.valid) {
      console.error('BLOCKED: reCAPTCHA verification failed');
      return res.status(403).json({ 
        error: 'BLOCKED: reCAPTCHA verification failed. Please try refreshing the page.',
        blocked: true,
        reason: recaptchaResult?.reason || 'Verification failed'
      });
    }
    
    // Only block extremely low scores (obvious bots)
    if (recaptchaResult.score < 0.3) {
      console.error('BLOCKED: Very low reCAPTCHA score');
      return res.status(403).json({ 
        error: 'BLOCKED: Automated submission detected. Please try again.',
        blocked: true,
        score: recaptchaResult.score
      });
    }
    
    console.log('reCAPTCHA verification PASSED with score:', recaptchaResult.score);
    
    // LIGHT BOT DETECTION - Only check for very obvious bot patterns
    const obviousBotPatterns = [
      /test\s*bot/i,
      /aaaaaa.*bbbbbb.*cccccc/i,
      /@(test|fake|spam)\./i
    ];
    
    const formText = JSON.stringify(formData).toLowerCase();
    for (const pattern of obviousBotPatterns) {
      if (pattern.test(formText)) {
        console.error('BLOCKED: Obvious bot pattern detected:', pattern);
        return res.status(403).json({ 
          error: 'BLOCKED: Suspicious content detected. Please use genuine information.',
          blocked: true,
          pattern: pattern.toString()
        });
      }
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
  // Production secret key for 6LeB5sQsAAAAAOAvk1OSlJ7YigEt7GiV2Di80ONS
  const secretKey = '6LeB5sQsAAAAAKrSwpvXgHSx-PsIrbwk2VyQtuQZ';
  
  console.log('STRICT reCAPTCHA verification starting...');
  
  if (!token || token.length < 100) {
    console.error('FAILED: Invalid or missing token');
    return { valid: false, reason: 'Invalid token', score: 0 };
  }
  
  try {
    // ONLY use standard reCAPTCHA API - no fallbacks, no enterprise complexity
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });
    
    if (!response.ok) {
      console.error('FAILED: API request failed');
      return { valid: false, reason: 'API request failed', score: 0 };
    }
    
    const result = await response.json();
    console.log('reCAPTCHA API result:', result);
    
    // STRICT VALIDATION - must pass all checks
    if (!result.success) {
      console.error('FAILED: reCAPTCHA not successful:', result['error-codes']);
      return { valid: false, reason: `API error: ${result['error-codes']?.join(', ')}`, score: 0 };
    }
    
    // For v3, check score - Use reasonable threshold
    if (result.score !== undefined) {
      const score = result.score;
      const threshold = 0.3; // REASONABLE threshold - allows most humans
      
      console.log(`Score check: ${score} >= ${threshold}?`);
      
      if (score < threshold) {
        console.error('FAILED: Score too low');
        return { valid: false, reason: `Score too low: ${score}`, score: score };
      }
    }
    
    console.log('SUCCESS: reCAPTCHA verification passed');
    return { valid: true, reason: 'Verification successful', score: result.score || 1.0 };
    
  } catch (error) {
    console.error('FAILED: Exception in verification:', error);
    return { valid: false, reason: `Exception: ${error.message}`, score: 0 };
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