
// lib/email-config.js
import fs from 'fs/promises'
import path from 'path'

export async function loadEmailConfig() {
  try {
    // Option 1: Load from environment variables
    if (process.env.EMAIL_HOST) {
      return {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        fromEmail: process.env.EMAIL_FROM,
        companyName: process.env.COMPANY_NAME || 'Your Company'
      }
    }
    
    // Option 2: Load from JSON file
    const configPath = path.join(process.cwd(), 'config', 'email.json')
    
    try {
      const configFile = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(configFile)
      
      // Validate required fields
      const required = ['host', 'port', 'user', 'pass', 'fromEmail']
      const missing = required.filter(field => !config[field])
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields in email config: ${missing.join(', ')}`)
      }
      
      return config
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        throw new Error('Email configuration file not found. Create config/email.json or set environment variables.')
      }
      throw fileError
    }
    
  } catch (error) {
    console.error('Error loading email config:', error)
    throw error
  }
}

export async function loadEmailTemplate() {
  try {
    // Option 1: Load from environment variable
    if (process.env.EMAIL_TEMPLATE) {
      return JSON.parse(process.env.EMAIL_TEMPLATE)
    }
    
    // Option 2: Load from JSON file
    const templatePath = path.join(process.cwd(), 'config', 'email-template.json')
    
    try {
      const templateFile = await fs.readFile(templatePath, 'utf-8')
      return JSON.parse(templateFile)
    } catch (fileError) {
      if (fileError.code === 'ENOENT') {
        // Return default template if file doesn't exist
        console.warn('Email template file not found, using default template')
        return {
          subject: 'Default Subject',
          content: 'Default email content'
        }
      }
      throw fileError
    }
    
  } catch (error) {
    console.error('Error loading email template:', error)
    throw error
  }
}

// Alternative: Load from database
export async function loadEmailConfigFromDB() {
  try {
    // Replace with your database logic
    // const db = await connectToDatabase()
    // const config = await db.collection('settings').findOne({ type: 'email' })
    
    // For now, return a sample config
    throw new Error('Database loading not implemented yet')
  } catch (error) {
    console.error('Error loading email config from database:', error)
    throw error
  }
}