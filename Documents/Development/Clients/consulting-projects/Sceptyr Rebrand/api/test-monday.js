// Simple test endpoint to verify Monday.com API credentials
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
    const BOARD_ID = process.env.MONDAY_BOARD_ID;
    
    console.log('Test - Environment check:', { 
      hasToken: !!MONDAY_API_TOKEN,
      tokenLength: MONDAY_API_TOKEN?.length,
      boardId: BOARD_ID 
    });

    if (!MONDAY_API_TOKEN || !BOARD_ID) {
      return res.status(500).json({ 
        error: 'Environment variables missing',
        hasToken: !!MONDAY_API_TOKEN,
        hasBoard: !!BOARD_ID
      });
    }

    // Test basic API connectivity
    const query = `query { me { name email } }`;
    
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': MONDAY_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const responseData = await response.json();
    console.log('Monday.com API test response:', responseData);

    if (!response.ok) {
      return res.status(500).json({ 
        error: 'Monday.com API error',
        status: response.status,
        response: responseData
      });
    }

    // Test board access with detailed column info
    const boardQuery = `query { boards(ids: ${BOARD_ID}) { name columns { id title type settings_str } } }`;
    
    const boardResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': MONDAY_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: boardQuery })
    });

    const boardData = await boardResponse.json();
    console.log('Board test response:', boardData);

    res.status(200).json({
      message: 'Monday.com API test successful',
      user: responseData.data?.me,
      board: boardData.data?.boards?.[0],
      environment: {
        tokenLength: MONDAY_API_TOKEN?.length,
        boardId: BOARD_ID
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message 
    });
  }
}