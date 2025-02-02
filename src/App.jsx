import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDateRange } from './features/range-selector/rangeSelectorSlice'
import './App.css'
import LineChartContainer from './components/containers/LineChartContainer'
import FunnelChartContainer from './components/containers/FunnelChartContainer'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function App() {
  const dispatch = useDispatch()
  const { currentRange } = useSelector((state) => state.dateRange)

  const range = [
    { name: '1 Month' },
    { name: '3 Month' },
    { name: '6 Month' },
    { name: '12 Month' },
    // { name: 'Custom' },
  ]

  const calculateDateRange = (selectedRange) => {
    let newStartDate = new Date()
    let newEndDate = new Date()

    switch (selectedRange) {
      case '1 Month':
        newStartDate.setMonth(newStartDate.getMonth() - 1)
        break
      case '3 Month':
        newStartDate.setMonth(newStartDate.getMonth() - 3)
        break
      case '6 Month':
        newStartDate.setMonth(newStartDate.getMonth() - 6)
        break
      case '12 Month':
        newStartDate.setFullYear(newStartDate.getFullYear() - 1)
        break
      case 'Custom':
        break
      default:
        break
    }

    return { 
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString() 
    }
  }

  useEffect(() => {
    if (currentRange) {
      const { startDate, endDate } = calculateDateRange(currentRange)
      dispatch(setDateRange({ startDate, endDate, currentRange }))
    }
  }, [currentRange, dispatch])

  return (
    <>
      <div className="min-h-full">
        <header className="">
          <div className="mx-auto max-w-7xl px-4 pt-6 pb-3 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          </div>
        </header>

        <main>
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex gap-4 pb-4">
              {range.map((ele, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (currentRange !== ele.name) dispatch(setDateRange({ ...calculateDateRange(ele.name), currentRange: ele.name }))
                  }}
                  className={classNames(
                    ele.name === currentRange
                      ? 'bg-blue-800 text-white'
                      : 'text-gray-500 hover:bg-blue-800 hover:cursor-pointer hover:text-white',
                    'rounded-md px-3 py-2 text-sm font-medium'
                  )}
                >
                  {ele.name}
                </div>
              ))}
            </div>
            <div className="border border-gray-300 rounded-xl py-11 ">
              <FunnelChartContainer />
            </div>

            <LineChartContainer />
          </div>
        </main>
      </div>
    </>
  )
}

export default App
