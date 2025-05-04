package com.drinkster.utils;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Queue;
import java.util.ArrayDeque;

/**
 * A fixed size queue that removes the oldest element when a new element is added
 * and the queue is full.
 *
 * @param <E> the type of elements in this queue
 * @author José Martins
 */
public class FixedSizeQueue<E> {

    @Getter
    @Setter
    private int maxSize;

    @Getter
    private final Queue<E> queue;

    public FixedSizeQueue(int maxSize) {
        this.maxSize = maxSize;
        this.queue = new ArrayDeque<>();
    }

    /**
     * Adds an element to the queue. If the queue is full, the oldest element is removed.
     *
     * @param element the element to add
     */
    public void add(E element) {
        if (queue.size() == maxSize) {
            queue.poll(); // Remove the oldest element
        }
        queue.add(element);
    }

    /**
     * Adds all elements from the provided list to the queue. If the queue is full,
     * the oldest elements are removed.
     *
     * @param elements the list of elements to add
     */
    public void addAll(List<E> elements) {
        for (E element : elements) {
            add(element);
        }
    }

    /**
     * Removes the specified element from the queue.
     *
     * @param element the element to remove
     * @return true if the element was removed, false otherwise
     */
    public boolean remove(E element) {
        return queue.remove(element);
    }
    
    /**
     * Returns the number of elements in the queue.
     *
     * @return the number of elements in the queue
     */
    public int size() {
        return queue.size();
    }

    /**
     * Checks if the queue is empty.
     *
     * @return true if the queue is empty, false otherwise
     */
    public boolean isEmpty() {
        return queue.isEmpty();
    }

    /**
     * Returns the first element of the queue without removing it.
     *
     * @return the first element of the queue
     */
    public E peek() {
        return queue.peek();
    }

    /**
     * Removes and returns the first element of the queue.
     *
     * @return the first element of the queue
     */
    public E poll() {
        return queue.poll();
    }

    /**
     * Clears the queue.
     */
    public void clear() {
        queue.clear();
    }

    /**
     * Checks if the queue contains the specified element.
     *
     * @param element the element to check
     * @return true if the queue contains the element, false otherwise
     */
    public boolean contains(E element) {
        return queue.contains(element);
    }

    /**
     * Returns the queue as a list.
     *
     * @return the queue as a list
     */
    public List<E> getQueueAsList() {
        return queue.stream().toList();
    }

}
