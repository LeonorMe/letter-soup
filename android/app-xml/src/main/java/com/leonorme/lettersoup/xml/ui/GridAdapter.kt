package com.leonorme.lettersoup.xml.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.leonorme.lettersoup.core.model.Cell
import com.leonorme.lettersoup.xml.databinding.ItemCellBinding

class GridAdapter(
    private val size: Int,
    private val cells: List<Cell>,
    private val onCellSelected: (Cell) -> Unit
) : RecyclerView.Adapter<GridAdapter.CellViewHolder>() {

    private val selectedIndices = mutableSetOf<Int>()
    private val foundIndices = mutableMapOf<Int, String>() // index to color

    inner class CellViewHolder(val binding: ItemCellBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CellViewHolder {
        val binding = ItemCellBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return CellViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CellViewHolder, position: Int) {
        val cell = cells[position]
        holder.binding.tvLetter.text = cell.letter.toString()
        
        val color = foundIndices[position]
        val card = holder.binding.root
        
        if (color != null) {
            card.setCardBackgroundColor(Color.parseColor(color))
            holder.binding.tvLetter.setTextColor(Color.WHITE)
        } else if (selectedIndices.contains(position)) {
            card.setCardBackgroundColor(Color.parseColor("#E0E0E0"))
            holder.binding.tvLetter.setTextColor(Color.BLACK)
        } else {
            card.setCardBackgroundColor(Color.parseColor("#F8F9FA"))
            holder.binding.tvLetter.setTextColor(Color.BLACK)
        }

        holder.itemView.setOnClickListener {
            onCellSelected(cell)
        }
    }

    override fun getItemCount() = cells.size

    fun toggleSelection(cell: Cell) {
        val index = cell.row * size + cell.col
        if (selectedIndices.contains(index)) {
            selectedIndices.remove(index)
        } else {
            selectedIndices.add(index)
        }
        notifyItemChanged(index)
    }

    fun clearSelection() {
        val indices = selectedIndices.toList()
        selectedIndices.clear()
        indices.forEach { notifyItemChanged(it) }
    }

    fun markFound(cells: List<Cell>, color: String) {
        cells.forEach {
            val index = it.row * size + it.col
            foundIndices[index] = color
            notifyItemChanged(index)
        }
    }
}
