import { useState, useEffect } from 'react'

type CustomOptionType = 'PRODUCT_SERVICE_CATEGORY' | 'BANK' | 'ACCOUNT_TYPE'

export function useCustomOptions(optionType: CustomOptionType) {
  const [customOptions, setCustomOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch custom options from database on mount
  useEffect(() => {
    const fetchCustomOptions = async () => {
      try {
        const response = await fetch(`/api/custom-options?type=${optionType}`)
        const data = await response.json()
        if (data.success) {
          setCustomOptions(data.options || [])
        }
      } catch (error) {
        console.error(`Error fetching custom ${optionType}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomOptions()
  }, [optionType])

  // Function to add a new custom option
  const addCustomOption = async (value: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/custom-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionType,
          value: value.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Add to local state
        setCustomOptions(prev => [...prev, data.option].sort((a, b) => 
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        ))
        return true
      } else {
        console.error('Error adding custom option:', data.error)
        return false
      }
    } catch (error) {
      console.error('Error adding custom option:', error)
      return false
    }
  }

  return { customOptions, loading, addCustomOption }
}


