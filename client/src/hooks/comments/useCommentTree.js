const useCommentTree = (setComments) => {
  const addToTree = (nodes, parentId, newNode) =>
    nodes.map((node) => {
      if (node._id === parentId) {
        return { ...node, children: [newNode, ...(node.children ?? [])] };
      }

      if (node.children) {
        return {
          ...node,
          children: addToTree(node.children, parentId, newNode),
        };
      }

      return node;
    });

  const editInTree = (nodes, id, content) =>
    nodes.map((node) => {
      if (node._id === id) return { ...node, content };
      if (node.children) {
        return { ...node, children: editInTree(node.children, id, content) };
      }
      return node;
    });

  const deleteFromTree = (nodes, id) =>
    nodes.filter((node) => node._id !== id).map((node) => ({
      ...node,
      children: node.children ? deleteFromTree(node.children, id) : [],
    }));

  const countNodes = (nodes) =>
    nodes.reduce((sum, node) => sum + 1 + countNodes(node.children ?? []), 0);

  return {
    handleAdd: (parentId, node) =>
      setComments((prev) => addToTree(prev, parentId, node)),
    handleEdit: (id, text) => setComments((prev) => editInTree(prev, id, text)),
    handleDelete: (id) => setComments((prev) => deleteFromTree(prev, id)),
    total: countNodes,
  };
};

export default useCommentTree;
