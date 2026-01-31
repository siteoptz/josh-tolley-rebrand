// Vercel serverless function to handle form submissions
// This function receives form data, sends it to Monday.com, and sends email notifications

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Monday.com API configuration
    const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
    const BOARD_ID = process.env.MONDAY_BOARD_ID; // Board ID for "Sceptyr Inquiries"
    
    if (!MONDAY_API_TOKEN || !BOARD_ID) {
      console.log('Missing env vars:', { hasToken: !!MONDAY_API_TOKEN, hasBoard: !!BOARD_ID });
      throw new Error('Monday.com configuration missing');
    }
    
    console.log('Environment check:', { 
      tokenLength: MONDAY_API_TOKEN?.length,
      boardId: BOARD_ID 
    });

    // Create item in Monday.com board
    console.log('Creating Monday.com item with data:', JSON.stringify(formData, null, 2));
    const mondayResponse = await createMondayItem(formData, MONDAY_API_TOKEN, BOARD_ID);
    console.log('Monday.com response:', JSON.stringify(mondayResponse, null, 2));
    
    // Send email notifications (keeping the existing email flow)
    let emailStatus = 'success';
    try {
      await sendEmailNotifications(formData);
    } catch (emailError) {
      console.error('Email notification error (non-critical):', emailError);
      emailStatus = 'failed';
    }
    
    // Return success response
    res.status(200).json({ 
      message: 'Form submitted successfully',
      mondayItemId: mondayResponse.data?.create_item?.id,
      emailStatus: emailStatus
    });

  } catch (error) {
    console.error('Form submission error:', error);
    
    // Fallback: Still try to send emails even if Monday.com fails
    try {
      await sendEmailNotifications(req.body);
    } catch (emailError) {
      console.error('Email fallback failed:', emailError);
    }
    
    res.status(500).json({ 
      message: 'Error processing form submission',
      error: error.message 
    });
  }
}

// Function to create item in Monday.com
async function createMondayItem(formData, apiToken, boardId) {
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

  // Map dropdown values to their IDs
  const accreditedMap = { "Yes": 1, "No": 2 };
  const interestMap = { 
    "Investment Opportunities": 1,
    "Legacy Guidance & Protection": 2, 
    "Strategic Applied Insurance": 3,
    "Business M&A or Exit": 4,
    "Balance Sheet Bankroll": 5
  };

  // Map form fields to Monday.com columns - fallback to text fields
  const columnValues = {
    "text_mm02dymw": `${formData.netWorth} | Email: ${formData.email} | Phone: ${formData.phone} | Accredited: ${formData.accredited} | Interest: ${formData.interest}`,
    "text_mm026pc4": formData.message,
    "date4": new Date().toISOString().split('T')[0]
  };

  const variables = {
    boardId: boardId,
    itemName: `${formData.firstName} ${formData.lastName}`,
    columnValues: JSON.stringify(columnValues)
  };
  
  console.log('Monday.com mutation variables:', {
    boardId,
    itemName: variables.itemName,
    columnValues: variables.columnValues
  });

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
    console.error('Monday.com API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Monday.com API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Check for GraphQL errors
  if (result.errors) {
    console.error('Monday.com GraphQL errors:', result.errors);
    throw new Error(`Monday.com GraphQL error: ${result.errors[0].message}`);
  }
  
  return result;
}

// Function to send email notifications (keeping existing email flow)
async function sendEmailNotifications(formData) {
  // Format email content
  const emailContent = `
New Consultation Request from Sceptyr Website

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Net Worth: ${formData.netWorth}
Accredited Investor: ${formData.accredited}
Primary Interest: ${formData.interest}
Message: ${formData.message}

Submitted: ${new Date().toLocaleString()}
  `.trim();

  // Send to FormSubmit as backup (or replace with your preferred email service)
  const formSubmitResponse = await fetch('https://formsubmit.co/antonio@siteoptz.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      ...formData,
      '_subject': 'New Consultation Request from Sceptyr Website',
      '_captcha': 'false',
      '_template': 'table',
      '_cc': 'info@sceptyr.com'
    }).toString()
  });

  if (!formSubmitResponse.ok) {
    throw new Error('Email notification failed');
  }
}