const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'DiagramCanvas.tsx');
try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix getAbsolutePosition syntax (remove potential extra braces/newlines)
    // We replace the entire function block.
    const startMarker = "// Node'un mutlak (dünya) pozisyonunu hesapla";
    const endMarker = "// Dagre layout fonksiyonu";

    // Find limits
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
        const newFunc = `// Node'un mutlak (dünya) pozisyonunu hesapla
const getAbsolutePosition = (node: Node, nodes: Node[]): { x: number; y: number } => {
  if (!node.parentNode) return node.position;
  const parent = nodes.find(n => n.id === node.parentNode);
  if (!parent) return node.position;

  const parentPos = getAbsolutePosition(parent, nodes);
  return {
    x: parentPos.x + node.position.x,
    y: parentPos.y + node.position.y
  };
};

`;
        content = content.substring(0, startIndex) + newFunc + content.substring(endIndex);
        console.log('Fixed getAbsolutePosition.');
    } else {
        console.log('Could not find getAbsolutePosition block markers.');
    }

    // 2. Fix updateEdgeHandles source logic if not already fixed
    const oldSourceLogic = `        // Node merkezlerini hesapla
        const sx = sourceNode.position.x + sourceDim.width / 2;
        const sy = sourceNode.position.y + sourceDim.height / 2;`;

    const newSourceLogic = `        // Node merkezlerini hesapla
        const sourcePos = getAbsolutePosition(sourceNode, currentNodes);
        const sx = sourcePos.x + sourceDim.width / 2;
        const sy = sourcePos.y + sourceDim.height / 2;`;

    if (content.includes(oldSourceLogic)) {
        content = content.replace(oldSourceLogic, newSourceLogic);
        console.log('Fixed updateEdgeHandles source logic.');
    }

    // 3. Fix updateEdgeHandles target logic
    const oldTargetLogic = `        const tx = targetNode.position.x + targetDim.width / 2;
        const ty = targetNode.position.y + targetDim.height / 2;`;

    const newTargetLogic = `        const targetPos = getAbsolutePosition(targetNode, currentNodes);
        const tx = targetPos.x + targetDim.width / 2;
        const ty = targetPos.y + targetDim.height / 2;`;

    if (content.includes(oldTargetLogic)) {
        content = content.replace(oldTargetLogic, newTargetLogic);
        console.log('Fixed updateEdgeHandles target logic.');
    }

    // 4. Fix onConnect logic
    // We look for the block starting with "if (sourceNode && targetNode) {"
    // This is harder to target safely with replace, assuming previous steps might have fixed it partly.
    // Let's trust my view_file that onConnect is mostly fixed, but maybe check for relative position usage.

    if (content.includes('const sx = sourceNode.position.x + sourceDim.width / 2;')) {
        console.log('WARNING: Relative position logic still found (possibly in onConnect). Attempting fix...');
        // Try to fix onConnect specifically (it finds nodes from closure, not arg)
        const onConnectOld = `          if (sourceNode && targetNode) {
            const sourceDim = getNodeDimensions(sourceNode);
            const targetDim = getNodeDimensions(targetNode);

            const sx = sourceNode.position.x + sourceDim.width / 2;
            const sy = sourceNode.position.y + sourceDim.height / 2;

            const tx = targetNode.position.x + targetDim.width / 2;
            const ty = targetNode.position.y + targetDim.height / 2;`;

        const onConnectNew = `          if (sourceNode && targetNode) {
            const sourceDim = getNodeDimensions(sourceNode);
            const targetDim = getNodeDimensions(targetNode);

            const sourcePos = getAbsolutePosition(sourceNode, nodes);
            const targetPos = getAbsolutePosition(targetNode, nodes);

            const sx = sourcePos.x + sourceDim.width / 2;
            const sy = sourcePos.y + sourceDim.height / 2;

            const tx = targetPos.x + targetDim.width / 2;
            const ty = targetPos.y + targetDim.height / 2;`;

        content = content.replace(onConnectOld, onConnectNew);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File update complete.');

} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
