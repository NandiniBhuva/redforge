// FlowDiagram.jsx
// D3-powered attack flow visualization
// Shows attacks firing from attacker node to LLM node in real time

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function FlowDiagram({ results, isScanning }) {
  // useRef gives us a reference to the actual DOM element
  // We need this so D3 can take control of the SVG
  const svgRef = useRef(null)

  // useEffect runs after React renders the component
  // We use it here to run D3 code after the SVG element exists in the DOM
  useEffect(() => {
    if (!svgRef.current) return

    // Get the SVG element and set its dimensions
    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth || 600
    const height = 300

    // Clear any previous drawing — important when results update
    svg.selectAll('*').remove()

    // Set viewBox for responsive sizing
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // --- Draw background ---
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#030712')
      .attr('rx', 12)

    // --- Node positions ---
    const attackerX = width * 0.15
    const llmX = width * 0.85
    const centerY = height / 2

    // --- Draw connection line (the "wire" between nodes) ---
    svg.append('line')
      .attr('x1', attackerX + 40)
      .attr('y1', centerY)
      .attr('x2', llmX - 40)
      .attr('y2', centerY)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')

    // --- Draw Attacker node ---
    const attackerGroup = svg.append('g')
      .attr('transform', `translate(${attackerX}, ${centerY})`)

    // Outer glow ring
    attackerGroup.append('circle')
      .attr('r', 45)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('opacity', 0.2)

    // Main circle
    attackerGroup.append('circle')
      .attr('r', 35)
      .attr('fill', '#1f0a0a')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)

    // Icon
    attackerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '20')
      .text('☠')

    // Label
    attackerGroup.append('text')
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-size', '12')
      .attr('font-weight', 'bold')
      .text('ATTACKER')

    // --- Draw LLM Target node ---
    const llmGroup = svg.append('g')
      .attr('transform', `translate(${llmX}, ${centerY})`)

    // Outer glow ring
    llmGroup.append('circle')
      .attr('r', 45)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1)
      .attr('opacity', 0.2)

    // Main circle
    llmGroup.append('circle')
      .attr('r', 35)
      .attr('fill', '#0a0f1f')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('class', 'llm-node')

    // Icon
    llmGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '20')
      .text('🤖')

    // Label
    llmGroup.append('text')
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#3b82f6')
      .attr('font-size', '12')
      .attr('font-weight', 'bold')
      .text('TARGET LLM')

    // --- Scanning animation ---
    if (isScanning) {
      // Pulsing ring on LLM node while scanning
      const pulse = llmGroup.append('circle')
        .attr('r', 35)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('opacity', 1)

      // D3 transition — animate the pulse expanding and fading
      function animatePulse() {
        pulse
          .attr('r', 35)
          .attr('opacity', 0.8)
          .transition()
          .duration(1200)
          .attr('r', 60)
          .attr('opacity', 0)
          .on('end', animatePulse) // loop
      }
      animatePulse()

      // Animated arrow flying from attacker to LLM
      const arrow = svg.append('circle')
        .attr('cx', attackerX + 40)
        .attr('cy', centerY)
        .attr('r', 5)
        .attr('fill', '#ef4444')

      function animateArrow() {
        arrow
          .attr('cx', attackerX + 40)
          .attr('opacity', 1)
          .transition()
          .duration(800)
          .ease(d3.easeLinear)
          .attr('cx', llmX - 40)
          .attr('opacity', 0.3)
          .on('end', animateArrow) // loop
      }
      animateArrow()

      // Status text
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7280')
        .attr('font-size', '11')
        .text('Firing attacks...')

      return // don't draw results while scanning
    }

    // --- Draw results (after scan) ---
    if (!results || results.length === 0) {
      // Empty state
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .attr('font-size', '12')
        .text('Run a scan to see attack flow')
      return
    }

    // Draw one arc per attack result
    // Space them vertically so they don't overlap
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    // Draw failed attacks (green arcs, below center)
    failed.forEach((result, i) => {
      const offset = (i - failed.length / 2) * 12
      const arcY = centerY + 30 + Math.abs(offset)

      svg.append('path')
        .attr('d', `M ${attackerX + 35} ${centerY} Q ${width/2} ${arcY} ${llmX - 35} ${centerY}`)
        .attr('fill', 'none')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.4)
        .attr('marker-end', 'url(#arrowGreen)')
    })

    // Draw successful attacks (red arcs, above center)
    successful.forEach((result, i) => {
      const offset = (i - successful.length / 2) * 14
      const arcY = centerY - 30 - Math.abs(offset)

      svg.append('path')
        .attr('d', `M ${attackerX + 35} ${centerY} Q ${width/2} ${arcY} ${llmX - 35} ${centerY}`)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
    })

    // Arrow markers
    const defs = svg.append('defs')

    defs.append('marker')
      .attr('id', 'arrowGreen')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('refX', 6)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,6 L8,3 z')
      .attr('fill', '#22c55e')

    // Stats text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-size', '12')
      .attr('font-weight', 'bold')
      .text(`${successful.length} attacks succeeded`)

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#22c55e')
      .attr('font-size', '11')
      .text(`${failed.length} attacks blocked`)

  // Re-run this effect whenever results or isScanning changes
  }, [results, isScanning])

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
      <h3 className="text-white font-semibold mb-3">Attack Flow</h3>
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '300px' }}
      />
    </div>
  )
}

export default FlowDiagram